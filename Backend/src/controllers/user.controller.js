import { User } from "../models/user.model.js";
import { Hotel } from "../models/hotel.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// GET /users/me
export const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { user: req.user.toSafeObject() }, "Profile fetched"));
});

// PUT /users/me
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (email) user.email = email;
  await user.save();

  res.status(200).json(new ApiResponse(200, { user: user.toSafeObject() }, "Profile updated"));
});

// GET /users/me/favourites
export const getFavourites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("favourites", "name slug images area rating");
  res.status(200).json(new ApiResponse(200, { favourites: user.favourites }, "Favourites fetched"));
});

// POST /users/me/favourites/:hotelId
export const addFavourite = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.hotelId);
  if (!hotel) throw new ApiError(404, "Hotel not found");

  await User.findByIdAndUpdate(req.user._id, { $addToSet: { favourites: hotel._id } });
  res.status(200).json(new ApiResponse(200, null, "Added to favourites"));
});

// DELETE /users/me/favourites/:hotelId
export const removeFavourite = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $pull: { favourites: req.params.hotelId } });
  res.status(200).json(new ApiResponse(200, null, "Removed from favourites"));
});

export default { getProfile, updateProfile, getFavourites, addFavourite, removeFavourite };
