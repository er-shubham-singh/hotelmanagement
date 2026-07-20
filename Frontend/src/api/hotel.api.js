import { axiosClient } from "./axiosClient.js";

export const getCities = () => axiosClient.get("/cities");

export const searchHotels = (params) => axiosClient.get("/hotels", { params });

export const getHotelBySlug = (slug, params) => axiosClient.get(`/hotels/${slug}`, { params });

export const getHotelReviews = (hotelId) => axiosClient.get(`/hotels/${hotelId}/reviews`);

export const createReview = (payload) => axiosClient.post("/reviews", payload);

export const getRoomAvailability = (roomId, params) => axiosClient.get(`/rooms/${roomId}/availability`, { params });
