import { axiosClient } from "./axiosClient.js";

export const getStats = () => axiosClient.get("/admin/stats");

export const getUsers = (params) => axiosClient.get("/admin/users", { params });

export const updateUserRole = (id, role) => axiosClient.patch(`/admin/users/${id}/role`, { role });

export const getAuditLogs = (params) => axiosClient.get("/admin/audit-logs", { params });
