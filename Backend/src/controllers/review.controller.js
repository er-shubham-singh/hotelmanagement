import mongoose from "mongoose";
import { Review } from "../models/review.model.js";
import { Hotel } from "../models/hotel.model.js";
import { Booking } from "../models/booking.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { BOOKING_STATUS } from "../config/constants.js";

const recalculateHotelRating = async (hotelId) => {
  const stats = await Review.aggregate([
    { $match: { hotel: new mongoose.Types.ObjectId(hotelId) } },
    { $group: { _id: "$hotel", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const { avgRating = 0, count = 0 } = stats[0] || {};
  await Hotel.findByIdAndUpdate(hotelId, {
    rating: Math.round(avgRating * 10) / 10,
    reviewCount: count,
  });
};

// GET /hotels/:id/reviews
export const getHotelReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ hotel: req.params.id })
    .populate("user", "name")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, { reviews }, "Reviews fetched"));
});

// POST /reviews (auth) — only guests with a COMPLETED stay at this hotel may review it.
export const createReview = asyncHandler(async (req, res) => {
  const { hotelId, rating, comment, bookingId } = req.body;
  if (!hotelId || !rating) throw new ApiError(400, "hotelId and rating are required");

  const existing = await Review.findOne({ hotel: hotelId, user: req.user._id });
  if (existing) throw new ApiError(409, "You have already reviewed this hotel");

  const completedStay = await Booking.findOne({
    _id: bookingId || undefined,
    hotel: hotelId,
    user: req.user._id,
    status: BOOKING_STATUS.COMPLETED,
  });
  if (!completedStay) {
    throw new ApiError(403, "You can only review a hotel after completing a stay there");
  }

  const review = await Review.create({
    hotel: hotelId,
    user: req.user._id,
    booking: completedStay._id,
    rating,
    comment,
  });

  await recalculateHotelRating(hotelId);

  res.status(201).json(new ApiResponse(201, { review }, "Review submitted"));
});

export default { getHotelReviews, createReview };
