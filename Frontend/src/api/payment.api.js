import { axiosClient } from "./axiosClient.js";

export const createPaymentOrder = (bookingId) => axiosClient.post("/payments/order", { bookingId });

export const verifyPayment = (payload) => axiosClient.post("/payments/verify", payload);

export const createPaymentQr = (bookingId) => axiosClient.post("/payments/qr", { bookingId });

export const mockCompletePayment = (bookingId) => axiosClient.post(`/payments/mock-pay/${bookingId}`);

export const createFineOrder = (bookingId) => axiosClient.post(`/payments/fine/${bookingId}`);

export const verifyFinePayment = (bookingId, payload) => axiosClient.post(`/payments/fine/${bookingId}/verify`, payload);
