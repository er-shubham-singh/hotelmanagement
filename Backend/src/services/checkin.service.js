import dayjs from "dayjs";
import { ApiError } from "../utils/ApiError.js";
import { BOOKING_STATUS, PAYMENT_STATUS, CHECKOUT_GRACE_MINUTES } from "../config/constants.js";
import { calculatePenalty } from "./pricing.service.js";
import * as bookingStatusService from "./bookingStatus.service.js";
import { generateInvoice } from "./invoice.service.js";
import { grantReferralRewardIfEligible } from "./referral.service.js";

// Shared by both the guest self-service check-in (booking.controller.js) and
// staff-verified check-in via access code (admin.controller.js) — same rules
// either way: auto-open the ACTIVE window if it's due, then move to CHECKED_IN.
export const performCheckIn = async (booking, { reason = "Checked in" } = {}) => {
  const now = new Date();

  if (booking.status === BOOKING_STATUS.CONFIRMED && dayjs(now).isAfter(booking.checkInAt)) {
    await bookingStatusService.transition(booking, BOOKING_STATUS.ACTIVE, { reason: "Check-in window opened", notify: false });
  }

  if (booking.status !== BOOKING_STATUS.ACTIVE) {
    throw new ApiError(409, `Cannot check in from status ${booking.status} — check-in window is not open`);
  }

  booking.checkedInAt = now;
  await booking.save();
  await bookingStatusService.transition(booking, BOOKING_STATUS.CHECKED_IN, { reason });

  return booking;
};

// Shared by both the guest self-service checkout and staff-verified checkout
// via access code — on-time checkout completes the stay; late checkout flips
// to OVERDUE and blocks completion until the penalty is paid (Part 2 flow).
export const performCheckOut = async (booking, { reason = "Checked out" } = {}) => {
  const now = new Date();
  const graceDeadline = dayjs(booking.checkOutAt).add(CHECKOUT_GRACE_MINUTES, "minute");

  if (booking.status === BOOKING_STATUS.CHECKED_IN) {
    if (dayjs(now).isAfter(graceDeadline)) {
      const penalty = calculatePenalty(booking, now);
      booking.penaltyAmount = penalty;
      booking.penaltyAccruedUntil = now;
      booking.paymentStatus = PAYMENT_STATUS.FINE_PENDING;
      await booking.save();
      await bookingStatusService.transition(booking, BOOKING_STATUS.OVERDUE, { reason: "Checkout grace period elapsed" });
      throw new ApiError(402, `Checkout is overdue by more than ${CHECKOUT_GRACE_MINUTES} minutes. Pay the ₹${penalty} penalty to complete checkout.`);
    }

    booking.checkedOutAt = now;
    await booking.save();
    await bookingStatusService.transition(booking, BOOKING_STATUS.COMPLETED, { reason });

    generateInvoice(booking).catch(() => null);
    grantReferralRewardIfEligible(booking.user).catch(() => null);

    return booking;
  }

  if (booking.status === BOOKING_STATUS.OVERDUE) {
    throw new ApiError(402, `A pending penalty of ₹${booking.penaltyAmount} must be paid before checkout can complete.`);
  }

  throw new ApiError(409, `Cannot check out from status ${booking.status}`);
};

export default { performCheckIn, performCheckOut };
