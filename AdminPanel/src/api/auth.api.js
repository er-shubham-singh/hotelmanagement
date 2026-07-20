import { axiosClient } from "./axiosClient.js";

export const login = (identifier, password) => axiosClient.post("/auth/login", { identifier, password });

export const refreshSession = () => axiosClient.post("/auth/refresh");

export const logout = () => axiosClient.post("/auth/logout");

export const getMe = () => axiosClient.get("/auth/me");
