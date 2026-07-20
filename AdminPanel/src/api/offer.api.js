import { axiosClient } from "./axiosClient.js";

export const getOffers = () => axiosClient.get("/offers");
export const createOffer = (payload) => axiosClient.post("/offers", payload);
export const updateOffer = (id, payload) => axiosClient.put(`/offers/${id}`, payload);
export const deleteOffer = (id) => axiosClient.delete(`/offers/${id}`);
