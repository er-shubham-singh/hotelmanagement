import { axiosClient } from "./axiosClient.js";

export const listAllBookings = (params) => axiosClient.get("/bookings/admin/all", { params });

export const checkInBooking = (id) => axiosClient.patch(`/bookings/${id}/checkin`);

export const checkOutBooking = (id) => axiosClient.patch(`/bookings/${id}/checkout`);

export const cancelBooking = (id, reason) => axiosClient.patch(`/bookings/${id}/cancel`, { reason });

export const issueRefund = (id, amount, reason) => axiosClient.post(`/admin/bookings/${id}/refund`, { amount, reason });

export const verifyCheckInCode = (id, code) => axiosClient.post(`/admin/bookings/${id}/verify-checkin`, { code });

export const verifyCheckOutCode = (id, code) => axiosClient.post(`/admin/bookings/${id}/verify-checkout`, { code });

export const resendAccessCode = (id, type) => axiosClient.post(`/admin/bookings/${id}/resend-code`, {}, { params: { type } });
