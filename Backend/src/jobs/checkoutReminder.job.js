import dayjs from "dayjs";
import { Booking } from "../models/booking.model.js";
import { BOOKING_STATUS, NOTIFICATION_TYPES, CHECKOUT_REMINDER_MINUTES } from "../config/constants.js";
import { sendNotification } from "../notifications/notification.service.js";

// Every ~1 min: reminds a checked-in guest to check out before the penalty
// window starts. Fires once per booking (checkoutReminderSent guards it).
export const runCheckoutReminderJob = async () => {
  const now = dayjs();
  const reminderThreshold = now.add(CHECKOUT_REMINDER_MINUTES, "minute").toDate();

  const due = await Booking.find({
    status: BOOKING_STATUS.CHECKED_IN,
    checkoutReminderSent: false,
    checkOutAt: { $lte: reminderThreshold, $gt: now.toDate() },
  });

  for (const booking of due) {
    await sendNotification(booking.user, {
      type: NOTIFICATION_TYPES.CHECKOUT_REMINDER,
      title: "Check out soon to avoid a penalty",
      body: `Booking ${booking.bookingRef} checkout is at ${dayjs(booking.checkOutAt).format("h:mm A")} — check out on time to avoid an overdue fine.`,
      data: { bookingId: String(booking._id), bookingRef: booking.bookingRef },
    });
    booking.checkoutReminderSent = true;
    await booking.save();
  }

  return due.length;
};

export default runCheckoutReminderJob;
