import mongoose from "mongoose";
import { BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } from "../config/constants.js";

const statusHistorySchema = new mongoose.Schema(
  {
    from: { type: String, default: null },
    to: { type: String, required: true },
    at: { type: Date, default: Date.now },
    reason: { type: String, default: "" },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },

    checkInDate: { type: Date, required: true },
    checkInTime: { type: String, required: true }, // "HH:mm"
    durationHrs: { type: Number, required: true }, // 3, 6, 12, 24
    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, default: 0 },
    rooms: { type: Number, required: true, min: 1, default: 1 },

    // Full datetimes computed once at creation — everything (availability
    // overlap math, cron jobs) queries these instead of re-deriving them.
    checkInAt: { type: Date, required: true, index: true },
    checkOutAt: { type: Date, required: true, index: true },

    guest: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
    },

    priceBreakdown: {
      base: { type: Number, required: true },
      tax: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      walletUsed: { type: Number, default: 0 },
      payable: { type: Number, required: true },
    },

    couponCode: { type: String, default: null },

    status: { type: String, enum: Object.values(BOOKING_STATUS), default: BOOKING_STATUS.ACCEPTED, index: true },
    paymentStatus: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },
    paymentMethod: { type: String, enum: Object.values(PAYMENT_METHODS), default: null },
    statusHistory: { type: [statusHistorySchema], default: [] },

    // Soft-hold on an ACCEPTED-but-unpaid booking; cron expires it past this.
    holdExpiresAt: { type: Date, default: null },

    // Check-in / check-out tracking
    checkedInAt: { type: Date, default: null },
    checkedOutAt: { type: Date, default: null },
    checkoutReminderSent: { type: Boolean, default: false },
    checkinVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    checkoutVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // Short-lived, hashed one-time codes shown to hotel staff at arrival/departure.
    // Only the hash is ever stored — the plaintext is emailed once and discarded.
    checkInCode: {
      hash: { type: String, default: null },
      issuedAt: { type: Date, default: null },
      usedAt: { type: Date, default: null },
      expiresAt: { type: Date, default: null },
    },
    checkOutCode: {
      hash: { type: String, default: null },
      issuedAt: { type: Date, default: null },
      usedAt: { type: Date, default: null },
      expiresAt: { type: Date, default: null },
    },

    // Overdue penalty
    penaltyAmount: { type: Number, default: 0 },
    penaltyAccruedUntil: { type: Date, default: null },

    // Razorpay
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    paymentLinkId: { type: String, default: null },
    paymentLinkUrl: { type: String, default: null },
    fineRazorpayOrderId: { type: String, default: null },

    // Refunds
    refundAmount: { type: Number, default: 0 },
    razorpayRefundId: { type: String, default: null },

    // Reschedule
    rescheduledFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    rescheduleCount: { type: Number, default: 0 },

    // Idempotency (prevents double-booking/double-charge under client retries)
    idempotencyKey: { type: String, default: null, unique: true, sparse: true },

    invoiceUrl: { type: String, default: null },

    cancelledAt: { type: Date, default: null },
    cancellationReason: { type: String, default: null },
  },
  { timestamps: true }
);

bookingSchema.index({ hotel: 1, checkInDate: 1 });
bookingSchema.index({ room: 1, checkInAt: 1, checkOutAt: 1 });

export const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
