import mongoose from "mongoose";
import { City } from "../models/city.model.js";
import { Hotel } from "../models/hotel.model.js";
import { Room } from "../models/room.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ROLES } from "../config/constants.js";
import { getSlotBasePrice } from "../services/pricing.service.js";
import { computeStayWindow, getAvailableUnits } from "../services/availability.service.js";
import { logAudit } from "../services/audit.service.js";

const assertOwnerOrAdmin = (hotel, user) => {
  if (user.role === ROLES.ADMIN) return;
  if (user.role === ROLES.HOTEL_OWNER && hotel.owner?.toString() === user._id.toString()) return;
  throw new ApiError(403, "You do not have permission to manage this hotel");
};

// ---------- Cities ----------

// GET /cities
export const getCities = asyncHandler(async (req, res) => {
  const cities = await City.find({ isActive: true }).sort({ name: 1 });
  res.status(200).json(new ApiResponse(200, { cities }, "Cities fetched"));
});

// POST /cities (admin)
export const createCity = asyncHandler(async (req, res) => {
  const { name, state, heroImage } = req.body;
  if (!name) throw new ApiError(400, "City name is required");
  const city = await City.create({ name, state, heroImage });
  res.status(201).json(new ApiResponse(201, { city }, "City created"));
});

// PUT /cities/:id (admin)
export const updateCity = asyncHandler(async (req, res) => {
  const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!city) throw new ApiError(404, "City not found");
  res.status(200).json(new ApiResponse(200, { city }, "City updated"));
});

// DELETE /cities/:id (admin)
export const deleteCity = asyncHandler(async (req, res) => {
  const city = await City.findByIdAndDelete(req.params.id);
  if (!city) throw new ApiError(404, "City not found");
  res.status(200).json(new ApiResponse(200, null, "City deleted"));
});

// ---------- Hotels ----------

// GET /hotels?city=&checkIn=&time=&duration=&tags=&minPrice=&maxPrice=&area=&sort=&page=
export const searchHotels = asyncHandler(async (req, res) => {
  const {
    city,
    tags,
    minPrice,
    maxPrice,
    area,
    sort = "recommended",
    page = 1,
    limit = 10,
    q,
  } = req.query;

  const filter = { isActive: true };

  if (city) {
    const cityDoc = await City.findOne({ slug: city });
    if (cityDoc) filter.city = cityDoc._id;
    else return res.status(200).json(new ApiResponse(200, { hotels: [], total: 0, page: 1, pages: 0 }, "No hotels found"));
  }
  if (area) filter.area = new RegExp(area, "i");
  if (tags) {
    const tagList = Array.isArray(tags) ? tags : tags.split(",");
    filter.tags = { $in: tagList };
  }
  if (q) filter.$text = { $search: q };

  const sortMap = {
    recommended: { rating: -1 },
    rating_desc: { rating: -1 },
    newest: { createdAt: -1 },
  };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Number(limit));

  let hotels = await Hotel.find(filter)
    .populate("city", "name slug")
    .sort(sortMap[sort] || sortMap.recommended)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  const hotelIds = hotels.map((h) => h._id);
  const rooms = await Room.find({ hotel: { $in: hotelIds }, isActive: true }).lean();

  hotels = hotels.map((hotel) => {
    const hotelRooms = rooms.filter((r) => r.hotel.toString() === hotel._id.toString());
    const cheapestRoom = hotelRooms.reduce((min, r) => {
      const price = r.priceSlots?.threeHr ?? r.priceSlots?.sixHr ?? r.priceSlots?.twelveHr ?? r.priceSlots?.fullDay;
      if (price == null) return min;
      return min === null || price < min ? price : min;
    }, null);
    return { ...hotel, priceSlots: hotelRooms[0]?.priceSlots || {}, fromPrice: cheapestRoom };
  });

  if (minPrice || maxPrice) {
    hotels = hotels.filter((h) => {
      if (h.fromPrice == null) return false;
      if (minPrice && h.fromPrice < Number(minPrice)) return false;
      if (maxPrice && h.fromPrice > Number(maxPrice)) return false;
      return true;
    });
  }

  const total = await Hotel.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(
      200,
      { hotels, total, page: pageNum, pages: Math.ceil(total / limitNum) },
      "Hotels fetched"
    )
  );
});

// GET /hotels/:slug
export const getHotelBySlug = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findOne({ slug: req.params.slug, isActive: true }).populate("city", "name slug");
  if (!hotel) throw new ApiError(404, "Hotel not found");

  const rooms = await Room.find({ hotel: hotel._id, isActive: true });

  const { checkIn, time, duration, adults, children } = req.query;
  let priceQuote = null;
  if (duration) {
    priceQuote = rooms.map((room) => {
      try {
        const price = getSlotBasePrice(room, Number(duration));
        return { roomId: room._id, price };
      } catch (error) {
        return { roomId: room._id, price: null };
      }
    });
  }

  res.status(200).json(
    new ApiResponse(200, { hotel, rooms, query: { checkIn, time, duration, adults, children }, priceQuote }, "Hotel fetched")
  );
});

// POST /hotels (admin | hotelOwner)
export const createHotel = asyncHandler(async (req, res) => {
  const { name, city, area, address, description, amenities, tags, starCategory, geo } = req.body;
  if (!name || !city || !area || !address) {
    throw new ApiError(400, "name, city, area, and address are required");
  }
  if (!mongoose.isValidObjectId(city)) throw new ApiError(400, "Invalid city id");

  const hotel = await Hotel.create({
    name,
    city,
    area,
    address,
    description,
    amenities,
    tags,
    starCategory,
    geo,
    owner: req.user.role === ROLES.HOTEL_OWNER ? req.user._id : req.body.owner,
  });

  logAudit(req.user._id, "hotel.create", "Hotel", hotel._id, { name: hotel.name });

  res.status(201).json(new ApiResponse(201, { hotel }, "Hotel created"));
});

// PUT /hotels/:id (admin | owner)
export const updateHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) throw new ApiError(404, "Hotel not found");
  assertOwnerOrAdmin(hotel, req.user);

  Object.assign(hotel, req.body);
  await hotel.save();

  logAudit(req.user._id, "hotel.update", "Hotel", hotel._id, { fields: Object.keys(req.body) });

  res.status(200).json(new ApiResponse(200, { hotel }, "Hotel updated"));
});

// DELETE /hotels/:id (admin | owner)
export const deleteHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) throw new ApiError(404, "Hotel not found");
  assertOwnerOrAdmin(hotel, req.user);

  hotel.isActive = false;
  await hotel.save();

  logAudit(req.user._id, "hotel.deactivate", "Hotel", hotel._id, {});

  res.status(200).json(new ApiResponse(200, null, "Hotel deactivated"));
});

// POST /hotels/:id/images (multer, admin | owner)
export const uploadHotelImages = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) throw new ApiError(404, "Hotel not found");
  assertOwnerOrAdmin(hotel, req.user);

  const files = req.files || [];
  if (!files.length) throw new ApiError(400, "No images uploaded");

  const urls = files.map((f) => `/uploads/hotels/${f.filename}`);
  hotel.images.push(...urls);
  await hotel.save();

  res.status(200).json(new ApiResponse(200, { images: hotel.images }, "Images uploaded"));
});

// ---------- Rooms (nested under a hotel) ----------

// POST /hotels/:hotelId/rooms (admin | owner)
export const createRoom = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.hotelId);
  if (!hotel) throw new ApiError(404, "Hotel not found");
  assertOwnerOrAdmin(hotel, req.user);

  const room = await Room.create({ ...req.body, hotel: hotel._id });
  logAudit(req.user._id, "room.create", "Room", room._id, { hotelId: String(hotel._id), type: room.type });
  res.status(201).json(new ApiResponse(201, { room }, "Room created"));
});

// PUT /rooms/:roomId (admin | owner) — this is also where totalUnits/pricing get edited,
// so capacity changes take effect immediately (availability math reads totalUnits live).
export const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.roomId);
  if (!room) throw new ApiError(404, "Room not found");

  const hotel = await Hotel.findById(room.hotel);
  assertOwnerOrAdmin(hotel, req.user);

  Object.assign(room, req.body);
  await room.save();

  logAudit(req.user._id, "room.update", "Room", room._id, { fields: Object.keys(req.body) });

  res.status(200).json(new ApiResponse(200, { room }, "Room updated"));
});

// DELETE /rooms/:roomId (admin | owner)
export const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.roomId);
  if (!room) throw new ApiError(404, "Room not found");

  const hotel = await Hotel.findById(room.hotel);
  assertOwnerOrAdmin(hotel, req.user);

  room.isActive = false;
  await room.save();
  logAudit(req.user._id, "room.deactivate", "Room", room._id, {});

  res.status(200).json(new ApiResponse(200, null, "Room deactivated"));
});

// GET /rooms/:roomId/availability?checkInDate=&checkInTime=&durationHrs=
export const getRoomAvailability = asyncHandler(async (req, res) => {
  const { checkInDate, checkInTime, durationHrs } = req.query;
  if (!checkInDate || !checkInTime || !durationHrs) {
    throw new ApiError(400, "checkInDate, checkInTime, and durationHrs are required");
  }

  const room = await Room.findById(req.params.roomId);
  if (!room || !room.isActive) throw new ApiError(404, "Room not found");

  const { checkInAt, checkOutAt } = computeStayWindow(checkInDate, checkInTime, Number(durationHrs));
  const availability = await getAvailableUnits(room._id, checkInAt, checkOutAt);

  res.status(200).json(new ApiResponse(200, { ...availability, checkInAt, checkOutAt }, "Availability fetched"));
});

export default {
  getCities,
  createCity,
  updateCity,
  deleteCity,
  searchHotels,
  getHotelBySlug,
  createHotel,
  updateHotel,
  deleteHotel,
  uploadHotelImages,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomAvailability,
};
