import { Router } from "express";
import { getHotelReviews, createReview } from "../controllers/review.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/hotels/:id/reviews", getHotelReviews);
router.post("/reviews", authenticate, createReview);

export default router;
