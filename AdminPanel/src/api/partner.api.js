import { axiosClient } from "./axiosClient.js";

export const listLeads = (params) => axiosClient.get("/partner/leads", { params });
export const updateLeadStatus = (id, status) => axiosClient.patch(`/partner/leads/${id}`, { status });
