import { Router } from "express";
import { getHotelReviews, createReview, getMyReviews, updateReview } from "../controllers/review.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/hotels/:id/reviews", getHotelReviews);
router.get("/reviews/my", authenticate, getMyReviews);
router.post("/reviews", authenticate, createReview);
router.patch("/reviews/:id", authenticate, updateReview);

export default router;
