import { axiosClient } from "./axiosClient.js";

export const getNotifications = (page = 1) => axiosClient.get("/notifications", { params: { page } });

export const getUnreadCount = () => axiosClient.get("/notifications/unread-count");

export const markNotificationRead = (id) => axiosClient.patch(`/notifications/${id}/read`);

export const markAllNotificationsRead = () => axiosClient.patch("/notifications/read-all");

export const registerDeviceToken = (token) => axiosClient.post("/notifications/token", { token });

export const removeDeviceToken = (token) => axiosClient.delete("/notifications/token", { data: { token } });
