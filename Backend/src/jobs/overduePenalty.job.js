import dayjs from "dayjs";
import { Booking } from "../models/booking.model.js";
import { BOOKING_STATUS, PAYMENT_STATUS, CHECKOUT_GRACE_MINUTES, NOTIFICATION_TYPES } from "../config/constants.js";
import { calculatePenalty } from "../services/pricing.service.js";
import { transition } from "../services/bookingStatus.service.js";
import { sendNotification } from "../notifications/notification.service.js";

// Every ~5 min: flips CHECKED_IN bookings that are past checkout + grace
// into OVERDUE and starts/continues accruing a penalty. Also keeps
// re-accruing (and re-notifying on increase) for bookings already OVERDUE.
export const runOverduePenaltyJob = async () => {
  const now = dayjs();
  const graceCutoff = now.subtract(CHECKOUT_GRACE_MINUTES, "minute").toDate();

  let flipped = 0;

  const newlyOverdue = await Booking.find({
    status: BOOKING_STATUS.CHECKED_IN,
    checkOutAt: { $lt: graceCutoff },
  });

  for (const booking of newlyOverdue) {
    const penalty = calculatePenalty(booking, now.toDate());
    booking.penaltyAmount = penalty;
    booking.penaltyAccruedUntil = now.toDate();
    booking.paymentStatus = PAYMENT_STATUS.FINE_PENDING;
    await booking.save();
    await transition(booking, BOOKING_STATUS.OVERDUE, {
      reason: "Checkout grace period elapsed",
      notification: {
        title: "Checkout overdue",
        body: `Booking ${booking.bookingRef} is overdue — a penalty of ₹${penalty} is now due.`,
        type: NOTIFICATION_TYPES.OVERDUE_PENALTY,
      },
    });
    flipped += 1;
  }

  const stillOverdue = await Booking.find({ status: BOOKING_STATUS.OVERDUE });
  let reaccrued = 0;

  for (const booking of stillOverdue) {
    const penalty = calculatePenalty(booking, now.toDate());
    if (penalty > booking.penaltyAmount) {
      booking.penaltyAmount = penalty;
      booking.penaltyAccruedUntil = now.toDate();
      await booking.save();
      await sendNotification(booking.user, {
        type: NOTIFICATION_TYPES.OVERDUE_PENALTY,
        title: "Overdue penalty increasing",
        body: `Booking ${booking.bookingRef} penalty is now ₹${penalty} — please check out and pay to stop further accrual.`,
        data: { bookingId: String(booking._id), bookingRef: booking.bookingRef },
      });
      reaccrued += 1;
    }
  }

  return { flipped, reaccrued };
};

export default runOverduePenaltyJob;
