import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getBookingByRef,
  cancelBooking,
  rescheduleBooking,
  checkInBooking,
  checkOutBooking,
  listAllBookings,
} from "../controllers/booking.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../config/constants.js";

const router = Router();

router.post("/", authenticate, createBooking);
router.get("/my", authenticate, getMyBookings);
router.get("/admin/all", authenticate, requireRole(ROLES.ADMIN, ROLES.HOTEL_OWNER), listAllBookings);
router.get("/:ref", authenticate, getBookingByRef);
router.patch("/:id/cancel", authenticate, cancelBooking);
router.patch("/:id/reschedule", authenticate, rescheduleBooking);
router.patch("/:id/checkin", authenticate, checkInBooking);
router.patch("/:id/checkout", authenticate, checkOutBooking);

export default router;
