import { ApiError } from "../utils/ApiError.js";
import { BOOKING_STATUS, NOTIFICATION_TYPES } from "../config/constants.js";
import { emitToUser, emitToBooking } from "./realtime.service.js";
import { sendNotification } from "../notifications/notification.service.js";
import { issueAccessCode } from "./accessCode.service.js";
import { User } from "../models/user.model.js";
import { Hotel } from "../models/hotel.model.js";
import {
  sendBookingConfirmedEmail,
  sendPaymentReceiptEmail,
  sendCheckInCodeEmail,
  sendCheckOutCodeEmail,
  sendThankYouEmail,
} from "./email.service.js";

const { ACCEPTED, CONFIRMED, ACTIVE, CHECKED_IN, COMPLETED, OVERDUE, NO_SHOW, CANCELLED, EXPIRED } = BOOKING_STATUS;

// The single source of truth for which status changes are legal. Every
// status mutation on a Booking MUST go through transition() below — never
// set booking.status directly anywhere else in the codebase.
export const ALLOWED_TRANSITIONS = {
  [ACCEPTED]: [CONFIRMED, EXPIRED, CANCELLED],
  [CONFIRMED]: [ACTIVE, CANCELLED, NO_SHOW],
  [ACTIVE]: [CHECKED_IN, NO_SHOW, CANCELLED],
  [CHECKED_IN]: [COMPLETED, OVERDUE],
  [OVERDUE]: [COMPLETED],
  // Terminal states — no outgoing transitions.
  [COMPLETED]: [],
  [NO_SHOW]: [],
  [CANCELLED]: [],
  [EXPIRED]: [],
};

// Per-target-status default notification copy. Callers can override title/body/type.
const DEFAULT_NOTIFICATIONS = {
  [CONFIRMED]: (b) => ({
    type: NOTIFICATION_TYPES.BOOKING_CONFIRMED,
    title: "Booking confirmed!",
    body: `Your booking ${b.bookingRef} is confirmed. See you soon!`,
  }),
  [ACTIVE]: (b) => ({
    type: NOTIFICATION_TYPES.CHECKIN_OPEN,
    title: "Check-in window is open",
    body: `You can check in now for booking ${b.bookingRef}.`,
  }),
  [CHECKED_IN]: (b) => ({
    type: NOTIFICATION_TYPES.CHECKED_IN,
    title: "Checked in",
    body: `You're checked in for booking ${b.bookingRef}. Enjoy your stay!`,
  }),
  [COMPLETED]: (b) => ({
    type: NOTIFICATION_TYPES.BOOKING_COMPLETED,
    title: "Stay completed",
    body: `Your booking ${b.bookingRef} is complete. Thanks for staying with us!`,
  }),
  [OVERDUE]: (b) => ({
    type: NOTIFICATION_TYPES.OVERDUE_PENALTY,
    title: "Checkout overdue",
    body: `Booking ${b.bookingRef} is past checkout — a penalty is now accruing until you check out.`,
  }),
  [NO_SHOW]: (b) => ({
    type: NOTIFICATION_TYPES.NO_SHOW,
    title: "Marked as no-show",
    body: `Booking ${b.bookingRef} was marked as a no-show as the check-in window elapsed.`,
  }),
  [CANCELLED]: (b) => ({
    type: NOTIFICATION_TYPES.CANCELLED,
    title: "Booking cancelled",
    body: `Booking ${b.bookingRef} has been cancelled.`,
  }),
  [EXPIRED]: (b) => ({
    type: NOTIFICATION_TYPES.EXPIRED,
    title: "Booking hold expired",
    body: `Your unpaid hold for booking ${b.bookingRef} expired and the slot was released.`,
  }),
};

// Loads the guest's email + name and the hotel's display info needed by the
// email templates. Falls back gracefully — a booking's own `guest` fields
// cover phone/name even if the User record has no email on file.
const loadEmailContext = async (booking) => {
  const [user, hotel] = await Promise.all([
    User.findById(booking.user).select("name email"),
    Hotel.findById(booking.hotel).select("name slug"),
  ]);
  return {
    email: user?.email || booking.guest?.email || null,
    name: user?.name || booking.guest?.name || "Guest",
    hotelName: hotel?.name || "your hotel",
    hotelSlug: hotel?.slug || "",
  };
};

// Issues + persists an access code (check-in or check-out) on the booking and
// returns the plaintext for emailing. The hash is what gets stored/verified.
const issueAndSaveCode = async (booking, field) => {
  const { plaintext, record } = await issueAccessCode();
  booking[field] = record;
  await booking.save();
  return { plaintext, expiresAt: record.expiresAt };
};

// Fires the templated emails for a transition. Never throws — a mail
// provider hiccup must never fail the underlying status transition.
const runPostTransitionEmails = async (booking, toStatus) => {
  try {
    const ctx = await loadEmailContext(booking);
    if (!ctx.email) return; // phone-only guest with no email on file

    if (toStatus === CONFIRMED) {
      await sendBookingConfirmedEmail(ctx.email, {
        name: ctx.name,
        bookingRef: booking.bookingRef,
        hotelName: ctx.hotelName,
        checkInAt: booking.checkInAt,
        durationHrs: booking.durationHrs,
      });
      await sendPaymentReceiptEmail(ctx.email, { name: ctx.name, bookingRef: booking.bookingRef, priceBreakdown: booking.priceBreakdown });

      const { plaintext, expiresAt } = await issueAndSaveCode(booking, "checkInCode");
      await sendCheckInCodeEmail(ctx.email, { name: ctx.name, bookingRef: booking.bookingRef, hotelName: ctx.hotelName, code: plaintext, expiresAt });
    }

    if (toStatus === CHECKED_IN) {
      const { plaintext, expiresAt } = await issueAndSaveCode(booking, "checkOutCode");
      await sendCheckOutCodeEmail(ctx.email, { name: ctx.name, bookingRef: booking.bookingRef, hotelName: ctx.hotelName, code: plaintext, expiresAt });
    }

    if (toStatus === COMPLETED) {
      await sendThankYouEmail(ctx.email, { name: ctx.name, bookingRef: booking.bookingRef, hotelName: ctx.hotelName, hotelSlug: ctx.hotelSlug });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[bookingStatus] Post-transition email(s) for ${booking.bookingRef} (${toStatus}) failed:`, error.message);
  }
};

/**
 * Transitions a booking to a new status, validating the move, recording
 * statusHistory, persisting, and firing the realtime + notification side
 * effects. Returns the saved booking.
 */
export const transition = async (booking, toStatus, { reason = "", notify = true, notification, sendEmails = true } = {}) => {
  const fromStatus = booking.status;
  const legalTargets = ALLOWED_TRANSITIONS[fromStatus] || [];

  if (!legalTargets.includes(toStatus)) {
    throw new ApiError(409, `Illegal booking status transition: ${fromStatus} -> ${toStatus}`);
  }

  booking.status = toStatus;
  booking.statusHistory.push({ from: fromStatus, to: toStatus, at: new Date(), reason });
  await booking.save();

  emitToUser(booking.user, "booking:statusUpdate", {
    bookingId: booking._id,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
  });
  emitToBooking(booking._id, "booking:statusUpdate", {
    bookingId: booking._id,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
  });

  if (notify) {
    const payload = notification || DEFAULT_NOTIFICATIONS[toStatus]?.(booking);
    if (payload) {
      await sendNotification(booking.user, { ...payload, data: { bookingId: String(booking._id), bookingRef: booking.bookingRef } });
    }
  }

  // Check-in/checkout access codes + their emails are issued here (CONFIRMED
  // issues the check-in code, CHECKED_IN issues the checkout code, COMPLETED
  // sends the thank-you note) so this fires identically whether the status
  // change came from a cron job, a webhook, or a manual admin action.
  if (sendEmails && [CONFIRMED, CHECKED_IN, COMPLETED].includes(toStatus)) {
    runPostTransitionEmails(booking, toStatus).catch(() => null);
  }

  return booking;
};

export const canTransition = (fromStatus, toStatus) => (ALLOWED_TRANSITIONS[fromStatus] || []).includes(toStatus);

export default { transition, canTransition, ALLOWED_TRANSITIONS };
