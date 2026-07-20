import { Router } from "express";
import {
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
} from "../controllers/hotel.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { upload } from "../config/multer.js";
import { ROLES } from "../config/constants.js";

const router = Router();

const manageRoles = [ROLES.ADMIN, ROLES.HOTEL_OWNER];

// Cities
router.get("/cities", getCities);
router.post("/cities", authenticate, requireRole(ROLES.ADMIN), createCity);
router.put("/cities/:id", authenticate, requireRole(ROLES.ADMIN), updateCity);
router.delete("/cities/:id", authenticate, requireRole(ROLES.ADMIN), deleteCity);

// Hotels
router.get("/hotels", searchHotels);
router.get("/hotels/:slug", getHotelBySlug);
router.post("/hotels", authenticate, requireRole(...manageRoles), createHotel);
router.put("/hotels/:id", authenticate, requireRole(...manageRoles), updateHotel);
router.delete("/hotels/:id", authenticate, requireRole(...manageRoles), deleteHotel);
router.post(
  "/hotels/:id/images",
  authenticate,
  requireRole(...manageRoles),
  upload.array("images", 10),
  uploadHotelImages
);

// Rooms (nested under hotel for creation, flat for update/delete)
router.post("/hotels/:hotelId/rooms", authenticate, requireRole(...manageRoles), createRoom);
router.put("/rooms/:roomId", authenticate, requireRole(...manageRoles), updateRoom);
router.delete("/rooms/:roomId", authenticate, requireRole(...manageRoles), deleteRoom);
router.get("/rooms/:roomId/availability", getRoomAvailability);

export default router;
