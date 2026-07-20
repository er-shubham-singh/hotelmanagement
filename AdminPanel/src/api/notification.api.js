import { axiosClient } from "./axiosClient.js";

export const getNotifications = (page = 1) => axiosClient.get("/notifications", { params: { page } });

export const getUnreadCount = () => axiosClient.get("/notifications/unread-count");

export const markAllNotificationsRead = () => axiosClient.patch("/notifications/read-all");
