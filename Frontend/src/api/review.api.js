import { axiosClient } from "./axiosClient.js";

// Per-hotel reviews already live in hotel.api.js (getHotelReviews) — this
// module covers the current user's own reviews (dashboard + review prompt).
export const getMyReviews = () => axiosClient.get("/reviews/my");

export const createReview = (payload) => axiosClient.post("/reviews", payload);

export const updateReview = (id, payload) => axiosClient.patch(`/reviews/${id}`, payload);
