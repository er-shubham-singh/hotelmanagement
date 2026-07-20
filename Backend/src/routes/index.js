import { Router } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";
import authRoutes from "./auth.routes.js";
import hotelRoutes from "./hotel.routes.js";
import bookingRoutes from "./booking.routes.js";
import offerRoutes from "./offer.routes.js";
import userRoutes from "./user.routes.js";
import reviewRoutes from "./review.routes.js";
import walletRoutes from "./wallet.routes.js";
import adminRoutes from "./admin.routes.js";
import partnerRoutes from "./partner.routes.js";
import notificationRoutes from "../notifications/notification.routes.js";
import paymentRoutes from "./payment.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json(new ApiResponse(200, { uptime: process.uptime() }, "StayByHour API is healthy"));
});

router.use("/auth", authRoutes);
router.use("/bookings", bookingRoutes);
router.use("/offers", offerRoutes);
router.use("/users", userRoutes);
router.use("/wallet", walletRoutes);
router.use("/admin", adminRoutes);
router.use("/notifications", notificationRoutes);
router.use("/payments", paymentRoutes);
router.use("/", hotelRoutes);
router.use("/", reviewRoutes);
router.use("/", partnerRoutes);

export default router;
