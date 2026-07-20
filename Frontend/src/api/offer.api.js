import { axiosClient } from "./axiosClient.js";

export const getOffers = () => axiosClient.get("/offers");

export const validateOffer = (code, amount) => axiosClient.post("/offers/validate", { code, amount });
