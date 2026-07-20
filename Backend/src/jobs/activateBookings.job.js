import { Booking } from "../models/booking.model.js";
import { BOOKING_STATUS } from "../config/constants.js";
import { transition } from "../services/bookingStatus.service.js";

// Every ~1 min: opens the check-in window — CONFIRMED bookings whose
// checkInAt has arrived (and checkOutAt hasn't yet passed) become ACTIVE.
export const runActivateBookingsJob = async () => {
  const now = new Date();

  const due = await Booking.find({
    status: BOOKING_STATUS.CONFIRMED,
    checkInAt: { $lte: now },
    checkOutAt: { $gt: now },
  });

  for (const booking of due) {
    await transition(booking, BOOKING_STATUS.ACTIVE, { reason: "Check-in window opened" });
  }

  return due.length;
};

export default runActivateBookingsJob;
