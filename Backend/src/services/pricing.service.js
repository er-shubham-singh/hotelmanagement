import dayjs from "dayjs";
import { ApiError } from "../utils/ApiError.js";
import { TAX_RATE, SLOT_DURATIONS, OVERDUE_PENALTY_PER_HOUR, REFUND_POLICY } from "../config/constants.js";

const SLOT_FIELD_BY_DURATION = {
  [SLOT_DURATIONS.THREE_HR]: "threeHr",
  [SLOT_DURATIONS.SIX_HR]: "sixHr",
  [SLOT_DURATIONS.TWELVE_HR]: "twelveHr",
  [SLOT_DURATIONS.FULL_DAY]: "fullDay",
};

// Server-side source of truth for pricing — never trust a client-supplied total.
export const getSlotBasePrice = (room, durationHrs) => {
  const field = SLOT_FIELD_BY_DURATION[durationHrs];
  if (!field) throw new ApiError(400, "Invalid stay duration");

  const price = room.priceSlots?.[field];
  if (price === null || price === undefined) {
    throw new ApiError(400, `This room is unavailable for a ${durationHrs}-hour stay`);
  }
  return price;
};

export const calculatePricing = ({ room, durationHrs, roomsCount = 1, discount = 0, walletUsed = 0 }) => {
  const unitPrice = getSlotBasePrice(room, durationHrs);
  const base = unitPrice * roomsCount;
  const tax = Math.round(base * TAX_RATE);

  const safeDiscount = Math.min(discount, base + tax);
  const afterDiscount = base + tax - safeDiscount;

  const safeWalletUsed = Math.min(walletUsed, afterDiscount);
  const payable = Math.max(0, Math.round(afterDiscount - safeWalletUsed));

  return {
    base,
    tax,
    discount: Math.round(safeDiscount),
    walletUsed: Math.round(safeWalletUsed),
    payable,
  };
};

// Penalty accrues per full/partial hour past checkOutAt + grace period, up to `now`.
export const calculatePenalty = (booking, now = new Date()) => {
  const overdueSince = dayjs(booking.checkOutAt);
  const hoursLate = Math.max(0, dayjs(now).diff(overdueSince, "hour", true));
  const billableHours = Math.ceil(hoursLate);
  return billableHours * OVERDUE_PENALTY_PER_HOUR;
};

// Tiered cancellation refund policy based on how far ahead of check-in the
// cancellation happens. Operates on the amount actually paid (payable).
export const calculateRefund = (booking, now = new Date()) => {
  const hoursBeforeCheckIn = dayjs(booking.checkInAt).diff(now, "hour", true);
  const paid = booking.priceBreakdown.payable;

  if (hoursBeforeCheckIn >= REFUND_POLICY.FULL_REFUND_HOURS_BEFORE) {
    return { refundAmount: paid, percent: 100 };
  }
  if (hoursBeforeCheckIn >= REFUND_POLICY.PARTIAL_REFUND_HOURS_BEFORE) {
    const amount = Math.round((paid * REFUND_POLICY.PARTIAL_REFUND_PERCENT) / 100);
    return { refundAmount: amount, percent: REFUND_POLICY.PARTIAL_REFUND_PERCENT };
  }
  return { refundAmount: 0, percent: 0 };
};

export default { getSlotBasePrice, calculatePricing, calculatePenalty, calculateRefund };
