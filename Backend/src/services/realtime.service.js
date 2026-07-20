import { getIO } from "../config/socket.js";

export const emitToUser = (userId, event, payload) => {
  const io = getIO();
  if (!io || !userId) return;
  io.to(String(userId)).emit(event, payload);
};

export const emitToBooking = (bookingId, event, payload) => {
  const io = getIO();
  if (!io || !bookingId) return;
  io.to(`booking:${bookingId}`).emit(event, payload);
};

export default { emitToUser, emitToBooking };
