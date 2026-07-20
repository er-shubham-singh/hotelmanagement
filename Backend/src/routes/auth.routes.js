import { Router } from "express";
import rateLimit from "express-rate-limit";
import { body } from "express-validator";
import {
  sendOtp,
  verifyOtp,
  register,
  login,
  googleLogin,
  refresh,
  logout,
  getMe,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later" },
});

router.post(
  "/send-otp",
  authLimiter,
  [body("phone").isString().isLength({ min: 10, max: 15 }).withMessage("Valid phone number required")],
  validate,
  sendOtp
);

router.post(
  "/verify-otp",
  authLimiter,
  [
    body("phone").isString().isLength({ min: 10, max: 15 }).withMessage("Valid phone number required"),
    body("code").isString().isLength({ min: 6, max: 6 }).withMessage("6-digit code required"),
  ],
  validate,
  verifyOtp
);

router.post(
  "/register",
  authLimiter,
  [
    body("name").isString().trim().notEmpty(),
    body("phone").isString().isLength({ min: 10, max: 15 }),
    body("password").isString().isLength({ min: 6 }),
    body("email").optional().isEmail(),
  ],
  validate,
  register
);

router.post(
  "/login",
  authLimiter,
  [body("identifier").isString().notEmpty(), body("password").isString().notEmpty()],
  validate,
  login
);

router.post("/google", authLimiter, [body("idToken").isString().notEmpty()], validate, googleLogin);

router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);

export default router;
