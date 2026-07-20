import crypto from "crypto";
import mongoose from "mongoose";
import dayjs from "dayjs";
import { Booking } from "../models/booking.model.js";
import { Room } from "../models/room.model.js";
import { Hotel } from "../models/hotel.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { calculatePricing, calculateRefund } from "../services/pricing.service.js";
import { evaluateCoupon, incrementUsage } from "../services/coupon.service.js";
import { computeStayWindow, assertAvailable } from "../services/availability.service.js";
import { debitWallet, creditWallet } from "./wallet.controller.js";
import * as bookingStatusService from "../services/bookingStatus.service.js";
import { performCheckIn, performCheckOut } from "../services/checkin.service.js";
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  ROLES,
  HOLD_EXPIRY_MINUTES,
} from "../config/constants.js";

const generateBookingRef = () => `SBH-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

// Guests may only touch their own bookings. Admins can touch any booking.
// Hotel owners are scoped to bookings at hotels they actually own.
const assertOwnership = async (booking, user) => {
  if (booking.user.toString() === user._id.toString()) return;
  if (user.role === ROLES.ADMIN) return;
  if (user.role === ROLES.HOTEL_OWNER) {
    const hotel = await Hotel.findById(booking.hotel).select("owner");
    if (hotel?.owner?.toString() === user._id.toString()) return;
  }
  throw new ApiError(403, "You do not have access to this booking");
};

// POST /bookings
// Creates a soft-held ACCEPTED booking (or an immediately CONFIRMED one if
// wallet+coupon already cover the full amount). Real gateway payment is
// handled separately via /payments/order + /payments/verify, which moves
// ACCEPTED -> CONFIRMED.
export const createBooking = asyncHandler(async (req, res) => {
  const {
    roomId,
    checkInDate,
    checkInTime,
    durationHrs,
    adults,
    children = 0,
    rooms = 1,
    guest,
    couponCode,
    useWallet = false,
    paymentMethod,
    idempotencyKey,
  } = req.body;

  if (!roomId || !checkInDate || !checkInTime || !durationHrs || !adults || !guest?.name || !guest?.phone) {
    throw new ApiError(400, "Missing required booking fields");
  }
  if (!mongoose.isValidObjectId(roomId)) throw new ApiError(400, "Invalid room id");

  if (idempotencyKey) {
    const existing = await Booking.findOne({ idempotencyKey, user: req.user._id });
    if (existing) {
      return res.status(200).json(new ApiResponse(200, { booking: existing }, "Booking already created (idempotent replay)"));
    }
  }

  const room = await Room.findById(roomId);
  if (!room || !room.isActive) throw new ApiError(404, "Room not found or unavailable");

  const hotel = await Hotel.findById(room.hotel);
  if (!hotel || !hotel.isActive) throw new ApiError(404, "Hotel not found or unavailable");

  const { checkInAt, checkOutAt } = computeStayWindow(checkInDate, checkInTime, durationHrs);
  if (dayjs(checkInAt).isBefore(dayjs())) {
    throw new ApiError(400, "Check-in time must be in the future");
  }

  await assertAvailable(room._id, checkInAt, checkOutAt, rooms);

  // Server computes base + tax; never trusts a client-sent total.
  let pricing = calculatePricing({ room, durationHrs, roomsCount: rooms });

  let coupon = null;
  if (couponCode) {
    const { offer, discount } = await evaluateCoupon(couponCode, pricing.base + pricing.tax);
    coupon = offer;
    pricing = calculatePricing({ room, durationHrs, roomsCount: rooms, discount });
  }

  let walletUsed = 0;
  if (useWallet) {
    const amountAfterDiscount = pricing.base + pricing.tax - pricing.discount;
    // debitWallet throws if insufficient; cap the requested amount to the order total.
    const wallet = await debitWallet(req.user._id, Math.min(amountAfterDiscount, Number(useWallet) || amountAfterDiscount), "Booking payment hold");
    walletUsed = wallet ? Math.min(amountAfterDiscount, Number(useWallet) || amountAfterDiscount) : 0;
    pricing = calculatePricing({ room, durationHrs, roomsCount: rooms, discount: pricing.discount, walletUsed });
  }

  const fullyCoveredByWalletAndCoupon = pricing.payable === 0;

  const booking = await Booking.create({
    bookingRef: generateBookingRef(),
    user: req.user._id,
    hotel: hotel._id,
    room: room._id,
    checkInDate,
    checkInTime,
    durationHrs,
    adults,
    children,
    rooms,
    checkInAt,
    checkOutAt,
    guest,
    priceBreakdown: pricing,
    couponCode: coupon ? coupon.code : null,
    status: BOOKING_STATUS.ACCEPTED,
    paymentStatus: fullyCoveredByWalletAndCoupon ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING,
    paymentMethod: paymentMethod || (fullyCoveredByWalletAndCoupon ? "wallet" : null),
    holdExpiresAt: dayjs().add(HOLD_EXPIRY_MINUTES, "minute").toDate(),
    idempotencyKey: idempotencyKey || null,
    statusHistory: [{ from: null, to: BOOKING_STATUS.ACCEPTED, at: new Date(), reason: "Booking created" }],
  });

  if (coupon) await incrementUsage(coupon._id);

  // Nothing left to pay (wallet/coupon covered it) — confirm immediately.
  if (fullyCoveredByWalletAndCoupon) {
    await bookingStatusService.transition(booking, BOOKING_STATUS.CONFIRMED, { reason: "Fully covered by wallet/coupon" });
  }

  res.status(201).json(new ApiResponse(201, { booking }, "Booking created"));
});

// GET /bookings/my
export const getMyBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const bookings = await Booking.find(filter)
    .populate("hotel", "name slug images area")
    .populate("room", "type")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, { bookings }, "Bookings fetched"));
});

// GET /bookings/:ref
export const getBookingByRef = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ bookingRef: req.params.ref })
    .populate("hotel", "name slug images area address")
    .populate("room", "type capacity");

  if (!booking) throw new ApiError(404, "Booking not found");
  await assertOwnership(booking, req.user);

  res.status(200).json(new ApiResponse(200, { booking }, "Booking fetched"));
});

// PATCH /bookings/:id/cancel
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, "Booking not found");
  await assertOwnership(booking, req.user);
  if (!bookingStatusService.canTransition(booking.status, BOOKING_STATUS.CANCELLED)) {
    throw new ApiError(409, `Booking in status ${booking.status} cannot be cancelled`);
  }

  // Wallet portion is always credited back in full — it isn't real gateway money.
  if (booking.priceBreakdown.walletUsed > 0) {
    await creditWallet(booking.user, booking.priceBreakdown.walletUsed, "Refund for cancelled booking", booking.bookingRef);
  }

  // Cash portion (paid via gateway) follows the tiered refund policy.
  let refundAmount = 0;
  if (booking.paymentStatus === PAYMENT_STATUS.PAID) {
    const cashPaid = booking.priceBreakdown.payable;
    if (cashPaid > 0) {
      const refund = calculateRefund(booking);
      refundAmount = refund.refundAmount;
      if (refundAmount > 0) {
        await creditWallet(booking.user, refundAmount, `Cancellation refund (${refund.percent}%)`, booking.bookingRef);
      }
    }
    booking.refundAmount = refundAmount;
    booking.paymentStatus = refundAmount >= booking.priceBreakdown.payable ? PAYMENT_STATUS.REFUNDED : PAYMENT_STATUS.PARTIALLY_REFUNDED;
  }

  booking.cancelledAt = new Date();
  booking.cancellationReason = req.body?.reason || "Cancelled by user";
  await booking.save();

  await bookingStatusService.transition(booking, BOOKING_STATUS.CANCELLED, { reason: booking.cancellationReason });

  res.status(200).json(new ApiResponse(200, { booking, refundAmount }, "Booking cancelled"));
});

// PATCH /bookings/:id/reschedule { checkInDate, checkInTime, durationHrs }
// Only allowed before check-in (ACCEPTED/CONFIRMED). Re-prices for the new
// duration if it changed, and re-checks availability for the new window.
export const rescheduleBooking = asyncHandler(async (req, res) => {
  const { checkInDate, checkInTime, durationHrs } = req.body;
  if (!checkInDate || !checkInTime || !durationHrs) {
    throw new ApiError(400, "checkInDate, checkInTime, and durationHrs are required");
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, "Booking not found");
  await assertOwnership(booking, req.user);

  if (![BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.CONFIRMED].includes(booking.status)) {
    throw new ApiError(409, `Booking in status ${booking.status} can no longer be rescheduled`);
  }

  const room = await Room.findById(booking.room);
  if (!room || !room.isActive) throw new ApiError(404, "Room no longer available");

  const { checkInAt, checkOutAt } = computeStayWindow(checkInDate, checkInTime, durationHrs);
  if (dayjs(checkInAt).isBefore(dayjs())) {
    throw new ApiError(400, "Check-in time must be in the future");
  }

  await assertAvailable(room._id, checkInAt, checkOutAt, booking.rooms, { excludeBookingId: booking._id });

  const newPricing = calculatePricing({
    room,
    durationHrs,
    roomsCount: booking.rooms,
    discount: booking.priceBreakdown.discount,
    walletUsed: booking.priceBreakdown.walletUsed,
  });

  // A booking that's already been paid for can only be rescheduled to a slot
  // that costs the same or less — anything pricier would require collecting
  // an additional payment, which isn't supported by this endpoint.
  if (booking.paymentStatus === PAYMENT_STATUS.PAID && newPricing.payable > booking.priceBreakdown.payable) {
    throw new ApiError(
      400,
      "The new slot costs more than what's already been paid. Cancel and create a new booking instead."
    );
  }

  booking.checkInDate = checkInDate;
  booking.checkInTime = checkInTime;
  booking.durationHrs = durationHrs;
  booking.checkInAt = checkInAt;
  booking.checkOutAt = checkOutAt;
  booking.priceBreakdown = newPricing;
  booking.rescheduleCount += 1;
  booking.statusHistory.push({ from: booking.status, to: booking.status, at: new Date(), reason: "Rescheduled" });
  await booking.save();

  res.status(200).json(new ApiResponse(200, { booking }, "Booking rescheduled"));
});

// PATCH /bookings/:id/checkin
export const checkInBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, "Booking not found");
  await assertOwnership(booking, req.user);

  await performCheckIn(booking, { reason: "Guest checked in (self-service)" });

  res.status(200).json(new ApiResponse(200, { booking }, "Checked in"));
});

// PATCH /bookings/:id/checkout
export const checkOutBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, "Booking not found");
  await assertOwnership(booking, req.user);

  await performCheckOut(booking, { reason: "Checked out on time (self-service)" });

  res.status(200).json(new ApiResponse(200, { booking }, "Checked out — stay completed"));
});

// GET /bookings/admin/all (admin sees all; hotelOwner scoped to their own hotels)
export const listAllBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  if (req.user.role === ROLES.HOTEL_OWNER) {
    const ownedHotels = await Hotel.find({ owner: req.user._id }).select("_id");
    filter.hotel = { $in: ownedHotels.map((h) => h._id) };
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Number(limit));

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate("hotel", "name slug")
      .populate("user", "name phone email")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Booking.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, { bookings, total, page: pageNum, pages: Math.ceil(total / limitNum) }, "Bookings fetched")
  );
});

export default {
  createBooking,
  getMyBookings,
  getBookingByRef,
  cancelBooking,
  rescheduleBooking,
  checkInBooking,
  checkOutBooking,
  listAllBookings,
};
