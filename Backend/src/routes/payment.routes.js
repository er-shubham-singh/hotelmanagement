import { Router } from "express";
import {
  createBookingOrder,
  verifyBookingPayment,
  createBookingQr,
  mockCompletePayment,
  createFineOrder,
  verifyFinePayment,
} from "../controllers/payment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import rateLimit from "express-rate-limit";

const router = Router();

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(paymentLimiter);

router.post("/order", authenticate, createBookingOrder);
router.post("/verify", authenticate, verifyBookingPayment);
router.post("/qr", authenticate, createBookingQr);
router.post("/mock-pay/:bookingId", mockCompletePayment); // no auth: simulates an anonymous payer via QR/link
router.post("/fine/:bookingId", authenticate, createFineOrder);
router.post("/fine/:bookingId/verify", authenticate, verifyFinePayment);

export default router;
