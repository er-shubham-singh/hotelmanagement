import { axiosClient } from "./axiosClient.js";

export const getCities = () => axiosClient.get("/cities");
export const createCity = (payload) => axiosClient.post("/cities", payload);
export const updateCity = (id, payload) => axiosClient.put(`/cities/${id}`, payload);
export const deleteCity = (id) => axiosClient.delete(`/cities/${id}`);

export const searchHotels = (params) => axiosClient.get("/hotels", { params });
export const getHotelBySlug = (slug) => axiosClient.get(`/hotels/${slug}`);
export const createHotel = (payload) => axiosClient.post("/hotels", payload);
export const updateHotel = (id, payload) => axiosClient.put(`/hotels/${id}`, payload);
export const deleteHotel = (id) => axiosClient.delete(`/hotels/${id}`);
export const uploadHotelImages = (id, formData) =>
  axiosClient.post(`/hotels/${id}/images`, formData, { headers: { "Content-Type": "multipart/form-data" } });

export const createRoom = (hotelId, payload) => axiosClient.post(`/hotels/${hotelId}/rooms`, payload);
export const updateRoom = (roomId, payload) => axiosClient.put(`/rooms/${roomId}`, payload);
export const deleteRoom = (roomId) => axiosClient.delete(`/rooms/${roomId}`);
