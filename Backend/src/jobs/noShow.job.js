import { Booking } from "../models/booking.model.js";
import { BOOKING_STATUS } from "../config/constants.js";
import { transition } from "../services/bookingStatus.service.js";

// Every ~5 min: a CONFIRMED/ACTIVE booking whose entire check-in window has
// elapsed without the guest ever checking in is a no-show. Releases the
// slot (payment is forfeited — no refund on a no-show).
export const runNoShowJob = async () => {
  const now = new Date();

  const missed = await Booking.find({
    status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.ACTIVE] },
    checkOutAt: { $lte: now },
  });

  for (const booking of missed) {
    await transition(booking, BOOKING_STATUS.NO_SHOW, { reason: "Check-in window elapsed without check-in" });
  }

  return missed.length;
};

export default runNoShowJob;
