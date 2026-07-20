import { axiosClient } from "./axiosClient.js";

export const getProfile = () => axiosClient.get("/users/me");

export const updateProfile = (payload) => axiosClient.put("/users/me", payload);

export const getFavourites = () => axiosClient.get("/users/me/favourites");

export const addFavourite = (hotelId) => axiosClient.post(`/users/me/favourites/${hotelId}`);

export const removeFavourite = (hotelId) => axiosClient.delete(`/users/me/favourites/${hotelId}`);

export const getWallet = () => axiosClient.get("/wallet");

export const submitPartnerLead = (payload) => axiosClient.post("/partner/leads", payload);

export const submitContact = (payload) => axiosClient.post("/contact", payload);
