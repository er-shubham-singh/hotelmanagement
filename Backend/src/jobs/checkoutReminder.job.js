import dayjs from "dayjs";
import { Booking } from "../models/booking.model.js";
import { BOOKING_STATUS, NOTIFICATION_TYPES, CHECKOUT_REMINDER_MINUTES, CHECKOUT_GRACE_MINUTES } from "../config/constants.js";
import { sendNotification } from "../notifications/notification.service.js";

// Every ~1 min: two distinct warnings for a checked-in guest, both one-time
// (guarded by their own flag) —
//   1. Pre-checkout reminder, fired shortly BEFORE checkOutAt.
//   2. "Time crossed" warning, fired the moment checkOutAt has passed but the
//      grace period (before the overduePenalty job flips the booking to
//      OVERDUE and starts the fine) hasn't elapsed yet.
export const runCheckoutReminderJob = async () => {
  const now = dayjs();

  const preCheckoutDue = await Booking.find({
    status: BOOKING_STATUS.CHECKED_IN,
    checkoutReminderSent: false,
    checkOutAt: { $lte: now.add(CHECKOUT_REMINDER_MINUTES, "minute").toDate(), $gt: now.toDate() },
  });

  for (const booking of preCheckoutDue) {
    await sendNotification(booking.user, {
      type: NOTIFICATION_TYPES.CHECKOUT_REMINDER,
      title: "Check out soon to avoid a penalty",
      body: `Booking ${booking.bookingRef} checkout is at ${dayjs(booking.checkOutAt).format("h:mm A")} — check out on time to avoid an overdue fine.`,
      data: { bookingId: String(booking._id), bookingRef: booking.bookingRef },
    });
    booking.checkoutReminderSent = true;
    await booking.save();
  }

  const timeCrossedDue = await Booking.find({
    status: BOOKING_STATUS.CHECKED_IN,
    timeCrossedNotified: false,
    checkOutAt: { $lte: now.toDate(), $gt: now.subtract(CHECKOUT_GRACE_MINUTES, "minute").toDate() },
  });

  for (const booking of timeCrossedDue) {
    await sendNotification(booking.user, {
      type: NOTIFICATION_TYPES.CHECKOUT_TIME_CROSSED,
      title: "Checkout time has passed",
      body: `Your checkout time for booking ${booking.bookingRef} has passed. Please check out within the next ${CHECKOUT_GRACE_MINUTES} minutes to avoid a fine.`,
      data: { bookingId: String(booking._id), bookingRef: booking.bookingRef },
    });
    booking.timeCrossedNotified = true;
    await booking.save();
  }

  return preCheckoutDue.length + timeCrossedDue.length;
};

export default runCheckoutReminderJob;
