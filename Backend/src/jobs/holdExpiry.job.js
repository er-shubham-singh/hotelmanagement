import { Booking } from "../models/booking.model.js";
import { BOOKING_STATUS, PAYMENT_STATUS } from "../config/constants.js";
import { transition } from "../services/bookingStatus.service.js";
import { creditWallet } from "../controllers/wallet.controller.js";

// Every ~1 min: releases the slot for ACCEPTED-but-unpaid bookings whose
// hold window has passed. This is what actually frees the capacity, since
// availability.service excludes EXPIRED bookings from its overlap count.
export const runHoldExpiryJob = async () => {
  const stale = await Booking.find({
    status: BOOKING_STATUS.ACCEPTED,
    paymentStatus: PAYMENT_STATUS.PENDING,
    holdExpiresAt: { $lt: new Date() },
  });

  for (const booking of stale) {
    if (booking.priceBreakdown.walletUsed > 0) {
      await creditWallet(booking.user, booking.priceBreakdown.walletUsed, "Hold expired — wallet refunded", booking.bookingRef);
    }
    await transition(booking, BOOKING_STATUS.EXPIRED, { reason: "Payment hold expired unpaid" });
  }

  return stale.length;
};

export default runHoldExpiryJob;
