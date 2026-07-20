export const ROLES = {
  USER: "user",
  HOTEL_OWNER: "hotelOwner",
  ADMIN: "admin",
};

export const SLOT_DURATIONS = {
  THREE_HR: 3,
  SIX_HR: 6,
  TWELVE_HR: 12,
  FULL_DAY: 24,
};

// Booking status state machine — see services/bookingStatus.service.js for the
// legal-transition map. Never set `status` directly on a Booking document;
// always go through bookingStatusService.transition().
export const BOOKING_STATUS = {
  ACCEPTED: "ACCEPTED", // created, payment not done yet — soft hold on the slot
  CONFIRMED: "CONFIRMED", // payment succeeded — slot firmly reserved
  ACTIVE: "ACTIVE", // check-in window is open
  CHECKED_IN: "CHECKED_IN", // guest has checked in
  COMPLETED: "COMPLETED", // checked out on time, or overdue fine paid
  OVERDUE: "OVERDUE", // checkout time + grace period passed, not checked out
  NO_SHOW: "NO_SHOW", // check-in window elapsed, guest never checked in
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED", // ACCEPTED hold expired unpaid
};

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  FINE_PENDING: "FINE_PENDING",
  FINE_PAID: "FINE_PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
  PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
};

export const PAYMENT_METHODS = {
  UPI: "upi",
  CARD: "card",
  WALLET: "wallet",
  RAZORPAY: "razorpay",
};

export const OFFER_TYPES = {
  FLAT: "flat",
  PERCENT: "percent",
};

export const HOTEL_TAGS = {
  COUPLE_FRIENDLY: "couple_friendly",
  LOCAL_ID: "local_id",
  BUSINESS: "business",
};

export const TAX_RATE = 0.12; // 12% GST on room bookings

export const LEAD_STATUS = {
  NEW: "new",
  CONTACTED: "contacted",
  CONVERTED: "converted",
  REJECTED: "rejected",
};

export const AUTH_PROVIDERS = {
  LOCAL: "local", // email/password
  PHONE: "phone", // phone OTP
  GOOGLE: "google",
};

export const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
  CHECKIN_OPEN: "CHECKIN_OPEN",
  CHECKED_IN: "CHECKED_IN",
  CHECKOUT_REMINDER: "CHECKOUT_REMINDER",
  BOOKING_COMPLETED: "BOOKING_COMPLETED",
  OVERDUE_PENALTY: "OVERDUE_PENALTY",
  PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  REFUND: "REFUND",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW",
  EXPIRED: "EXPIRED",
  OFFER: "OFFER",
  WALLET_CREDIT: "WALLET_CREDIT",
  REFERRAL_REWARD: "REFERRAL_REWARD",
  CHECKIN_CODE: "CHECKIN_CODE",
  CHECKOUT_CODE: "CHECKOUT_CODE",
  THANK_YOU: "THANK_YOU",
};

// Business-rule durations (minutes). Overridable via env for tests/ops tuning.
export const HOLD_EXPIRY_MINUTES = Number(process.env.HOLD_EXPIRY_MINUTES) || 10;
export const CHECKOUT_GRACE_MINUTES = Number(process.env.CHECKOUT_GRACE_MINUTES) || 30;
export const CHECKOUT_REMINDER_MINUTES = Number(process.env.CHECKOUT_REMINDER_MINUTES) || 15;
export const OVERDUE_PENALTY_PER_HOUR = Number(process.env.OVERDUE_PENALTY_PER_HOUR) || 150;

// Check-in/checkout access codes
export const ACCESS_CODE_LENGTH = Number(process.env.ACCESS_CODE_LENGTH) || 8;
export const ACCESS_CODE_EXPIRY_HOURS = Number(process.env.ACCESS_CODE_EXPIRY_HOURS) || 48;

export const REFUND_POLICY = {
  FULL_REFUND_HOURS_BEFORE: 6, // full refund if cancelled 6+ hrs before check-in
  PARTIAL_REFUND_HOURS_BEFORE: 2, // 50% refund if cancelled 2-6 hrs before check-in
  PARTIAL_REFUND_PERCENT: 50,
};
