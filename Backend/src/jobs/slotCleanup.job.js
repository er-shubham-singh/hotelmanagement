import dayjs from "dayjs";
import { Booking } from "../models/booking.model.js";
import { BOOKING_STATUS, PAYMENT_STATUS, CHECKOUT_GRACE_MINUTES } from "../config/constants.js";
import { calculatePenalty } from "../services/pricing.service.js";
import { transition, canTransition } from "../services/bookingStatus.service.js";
import { creditWallet } from "../controllers/wallet.controller.js";

// Every ~10 min: a broad reconciliation safety net. The narrower jobs
// (holdExpiry/activateBookings/noShow/overduePenalty) should catch
// everything under normal operation — this sweep exists to force-release
// anything left stuck in a non-terminal state past its window (e.g. after
// a job outage), and logs whatever it had to fix so it's visible in ops.
export const runSlotCleanupJob = async () => {
  const now = new Date();
  const fixes = [];

  // Any still-ACCEPTED hold whose expiry has clearly passed (belt-and-suspenders
  // on top of holdExpiry.job).
  const staleHolds = await Booking.find({
    status: BOOKING_STATUS.ACCEPTED,
    holdExpiresAt: { $lt: now },
  });
  for (const booking of staleHolds) {
    if (booking.priceBreakdown.walletUsed > 0) {
      await creditWallet(booking.user, booking.priceBreakdown.walletUsed, "Hold expired — wallet refunded", booking.bookingRef);
    }
    await transition(booking, BOOKING_STATUS.EXPIRED, { reason: "Reconciliation: stale unpaid hold" });
    fixes.push({ bookingRef: booking.bookingRef, action: "EXPIRED (stale hold)" });
  }

  // CONFIRMED/ACTIVE bookings whose window fully elapsed without check-in.
  const orphanedNoShows = await Booking.find({
    status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.ACTIVE] },
    checkOutAt: { $lt: now },
  });
  for (const booking of orphanedNoShows) {
    await transition(booking, BOOKING_STATUS.NO_SHOW, { reason: "Reconciliation: window elapsed without check-in" });
    fixes.push({ bookingRef: booking.bookingRef, action: "NO_SHOW (reconciled)" });
  }

  // CHECKED_IN bookings well past grace that the penalty job hasn't flagged yet.
  const graceCutoff = dayjs(now).subtract(CHECKOUT_GRACE_MINUTES, "minute").toDate();
  const orphanedOverdue = await Booking.find({
    status: BOOKING_STATUS.CHECKED_IN,
    checkOutAt: { $lt: graceCutoff },
  });
  for (const booking of orphanedOverdue) {
    const penalty = calculatePenalty(booking, now);
    booking.penaltyAmount = penalty;
    booking.penaltyAccruedUntil = now;
    booking.paymentStatus = PAYMENT_STATUS.FINE_PENDING;
    await booking.save();
    await transition(booking, BOOKING_STATUS.OVERDUE, { reason: "Reconciliation: overdue not yet flagged" });
    fixes.push({ bookingRef: booking.bookingRef, action: "OVERDUE (reconciled)" });
  }

  // Sanity check: any booking sitting in a status with zero legal forward
  // transitions AND not one of the four true terminal states is a data bug —
  // just log it loudly rather than silently mutating unknown state.
  const suspects = await Booking.find({
    status: { $nin: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED, BOOKING_STATUS.NO_SHOW, BOOKING_STATUS.EXPIRED] },
    checkOutAt: { $lt: dayjs(now).subtract(1, "day").toDate() },
  });
  for (const booking of suspects) {
    if (!canTransition(booking.status, BOOKING_STATUS.CANCELLED)) continue; // already handled above or genuinely terminal
    // eslint-disable-next-line no-console
    console.warn(`[slotCleanup] Booking ${booking.bookingRef} stuck in ${booking.status} for >24h past checkout — needs manual review`);
  }

  if (fixes.length) {
    // eslint-disable-next-line no-console
    console.log(`[slotCleanup] Reconciled ${fixes.length} booking(s):`, fixes);
  }

  return fixes;
};

export default runSlotCleanupJob;
