import { axiosClient } from "./axiosClient.js";

export const createBooking = (payload) => axiosClient.post("/bookings", payload);

export const getMyBookings = (status) => axiosClient.get("/bookings/my", { params: { status } });

export const getBookingByRef = (ref) => axiosClient.get(`/bookings/${ref}`);

export const cancelBooking = (id, reason) => axiosClient.patch(`/bookings/${id}/cancel`, { reason });

export const rescheduleBooking = (id, payload) => axiosClient.patch(`/bookings/${id}/reschedule`, payload);

export const checkInBooking = (id) => axiosClient.patch(`/bookings/${id}/checkin`);

export const checkOutBooking = (id) => axiosClient.patch(`/bookings/${id}/checkout`);
