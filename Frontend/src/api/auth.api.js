import { axiosClient } from "./axiosClient.js";

export const sendOtp = (phone) => axiosClient.post("/auth/send-otp", { phone });

export const verifyOtp = (phone, code, name, referralCode) =>
  axiosClient.post("/auth/verify-otp", { phone, code, name, referralCode });

export const register = (payload) => axiosClient.post("/auth/register", payload);

export const googleLogin = (idToken, referralCode) => axiosClient.post("/auth/google", { idToken, referralCode });

export const login = (identifier, password) => axiosClient.post("/auth/login", { identifier, password });

export const refreshSession = () => axiosClient.post("/auth/refresh");

export const logout = () => axiosClient.post("/auth/logout");

export const getMe = () => axiosClient.get("/auth/me");
