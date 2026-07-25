import dayjs from "dayjs";
import { Booking } from "../models/booking.model.js";
import { BOOKING_STATUS, NOTIFICATION_TYPES, CHECKIN_REMINDER_MINUTES } from "../config/constants.js";
import { sendNotification } from "../notifications/notification.service.js";

// Every ~1 min: reminds a guest that their check-in window opens soon, ahead
// of the activateBookings job that flips the booking ACTIVE right at the
// window open. Fires once per booking (checkinReminderSent guards it).
export const runCheckinReminderJob = async () => {
  const now = dayjs();
  const reminderThreshold = now.add(CHECKIN_REMINDER_MINUTES, "minute").toDate();

  const due = await Booking.find({
    status: BOOKING_STATUS.CONFIRMED,
    checkinReminderSent: false,
    checkInAt: { $lte: reminderThreshold, $gt: now.toDate() },
  });

  for (const booking of due) {
    await sendNotification(booking.user, {
      type: NOTIFICATION_TYPES.CHECKIN_REMINDER,
      title: "Your check-in window opens soon",
      body: `Booking ${booking.bookingRef} check-in opens at ${dayjs(booking.checkInAt).format("h:mm A")} — your check-in code is ready in your email.`,
      data: { bookingId: String(booking._id), bookingRef: booking.bookingRef },
    });
    booking.checkinReminderSent = true;
    await booking.save();
  }

  return due.length;
};

export default runCheckinReminderJob;
