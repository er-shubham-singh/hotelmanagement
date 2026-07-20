import axios from "axios";
import toast from "react-hot-toast";
import { env } from "../config/env.js";

let accessToken = null;
let onUnauthorized = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

export const axiosClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshPromise = null;

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (response?.status === 401 && !config._retry && !config.url?.includes("/auth/")) {
      config._retry = true;
      try {
        refreshPromise = refreshPromise || axiosClient.post("/auth/refresh");
        const { data } = await refreshPromise;
        refreshPromise = null;
        setAccessToken(data.data.accessToken);
        config.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return axiosClient(config);
      } catch (refreshError) {
        refreshPromise = null;
        setAccessToken(null);
        onUnauthorized?.();
        return Promise.reject(refreshError);
      }
    }

    const message = response?.data?.message || error.message || "Something went wrong";
    if (response?.status !== 401) toast.error(message);

    return Promise.reject(error);
  }
);

export default axiosClient;
