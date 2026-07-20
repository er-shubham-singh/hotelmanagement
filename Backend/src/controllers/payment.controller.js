import { Booking } from "../models/booking.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  createPaymentLinkWithQr,
} from "../services/payment.service.js";
import { isRazorpayConfigured } from "../config/razorpay.js";
import { transition } from "../services/bookingStatus.service.js";
import { emitToUser, emitToBooking } from "../services/realtime.service.js";
import { sendNotification } from "../notifications/notification.service.js";
import { incrementUsage } from "../services/coupon.service.js";
import { generateInvoice } from "../services/invoice.service.js";
import { grantReferralRewardIfEligible } from "../services/referral.service.js";
import { BOOKING_STATUS, PAYMENT_STATUS, NOTIFICATION_TYPES } from "../config/constants.js";

const loadOwnedBooking = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You do not have access to this booking");
  }
  return booking;
};

// POST /payments/order { bookingId }
export const createBookingOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  if (!bookingId) throw new ApiError(400, "bookingId is required");

  const booking = await loadOwnedBooking(bookingId, req.user._id);
  if (booking.status !== BOOKING_STATUS.ACCEPTED) {
    throw new ApiError(409, `Booking is ${booking.status} — payment is not applicable`);
  }
  if (booking.priceBreakdown.payable <= 0) {
    throw new ApiError(400, "Nothing is payable on this booking");
  }

  const order = await createOrder({
    amountRupees: booking.priceBreakdown.payable,
    receipt: booking.bookingRef,
    notes: { bookingId: String(booking._id), purpose: "booking" },
  });

  booking.razorpayOrderId = order.id;
  await booking.save();

  res.status(200).json(
    new ApiResponse(200, { orderId: order.id, amount: order.amount, currency: order.currency, mock: order.mock, keyId: process.env.RAZORPAY_KEY_ID || null }, "Order created")
  );
});

// POST /payments/verify { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
export const verifyBookingPayment = asyncHandler(async (req, res) => {
  const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  if (!bookingId || !razorpayOrderId || !razorpayPaymentId) {
    throw new ApiError(400, "bookingId, razorpayOrderId, and razorpayPaymentId are required");
  }

  const booking = await loadOwnedBooking(bookingId, req.user._id);
  if (booking.razorpayOrderId !== razorpayOrderId) {
    throw new ApiError(400, "Order does not match this booking");
  }

  const valid = verifyPaymentSignature({ orderId: razorpayOrderId, paymentId: razorpayPaymentId, signature: razorpaySignature });
  if (!valid) throw new ApiError(400, "Payment signature verification failed");

  await markBookingPaid(booking, razorpayPaymentId, razorpaySignature);

  res.status(200).json(new ApiResponse(200, { booking }, "Payment verified — booking confirmed"));
});

// Shared by verify + webhook so both paths behave identically.
const markBookingPaid = async (booking, paymentId, signature = null) => {
  if (booking.paymentStatus === PAYMENT_STATUS.PAID) return booking; // idempotent

  booking.paymentStatus = PAYMENT_STATUS.PAID;
  booking.razorpayPaymentId = paymentId;
  booking.razorpaySignature = signature;
  await booking.save();

  await transition(booking, BOOKING_STATUS.CONFIRMED, {
    reason: "Payment received",
    notification: {
      type: NOTIFICATION_TYPES.PAYMENT_SUCCESS,
      title: "Payment successful",
      body: `Payment received for booking ${booking.bookingRef}. Your stay is confirmed!`,
    },
  });

  emitToUser(booking.user, "payment:success", { bookingId: booking._id });
  emitToBooking(booking._id, "payment:success", { bookingId: booking._id });

  return booking;
};

// POST /payments/qr { bookingId } — shareable QR/link, works for the logged-in
// owner of the booking; the payer opening the link/QR need not be logged in.
export const createBookingQr = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  const booking = await loadOwnedBooking(bookingId, req.user._id);
  if (booking.status !== BOOKING_STATUS.ACCEPTED) {
    throw new ApiError(409, `Booking is ${booking.status} — payment is not applicable`);
  }

  const { linkId, url, qrDataUrl, mock } = await createPaymentLinkWithQr({
    amountRupees: booking.priceBreakdown.payable,
    description: `StayByHour booking ${booking.bookingRef}`,
    referenceId: booking.bookingRef,
    notes: { bookingId: String(booking._id), purpose: "booking" },
  });

  booking.paymentLinkId = linkId;
  booking.paymentLinkUrl = url;
  await booking.save();

  res.status(200).json(new ApiResponse(200, { url, qrDataUrl, mock }, "Payment link generated"));
});

// In mock mode there's no real gateway to redirect through, so this endpoint
// lets the QR/link page itself simulate the payer completing payment.
// POST /payments/mock-pay/:bookingId
export const mockCompletePayment = asyncHandler(async (req, res) => {
  if (isRazorpayConfigured) {
    throw new ApiError(404, "Not found");
  }

  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.status !== BOOKING_STATUS.ACCEPTED) {
    throw new ApiError(409, `Booking is ${booking.status} — payment is not applicable`);
  }

  await markBookingPaid(booking, `pay_mock_${Date.now()}`);

  res.status(200).json(new ApiResponse(200, { booking }, "Mock payment completed"));
});

// POST /payments/fine/:bookingId — order for the overdue penalty
export const createFineOrder = asyncHandler(async (req, res) => {
  const booking = await loadOwnedBooking(req.params.bookingId, req.user._id);
  if (booking.status !== BOOKING_STATUS.OVERDUE) {
    throw new ApiError(409, "This booking has no pending fine");
  }

  const order = await createOrder({
    amountRupees: booking.penaltyAmount,
    receipt: `${booking.bookingRef}-FINE`,
    notes: { bookingId: String(booking._id), purpose: "fine" },
  });

  booking.fineRazorpayOrderId = order.id;
  await booking.save();

  res.status(200).json(new ApiResponse(200, { orderId: order.id, amount: order.amount, mock: order.mock }, "Fine order created"));
});

// POST /payments/fine/:bookingId/verify
export const verifyFinePayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const booking = await loadOwnedBooking(req.params.bookingId, req.user._id);

  if (booking.fineRazorpayOrderId !== razorpayOrderId) {
    throw new ApiError(400, "Order does not match this booking's fine");
  }
  const valid = verifyPaymentSignature({ orderId: razorpayOrderId, paymentId: razorpayPaymentId, signature: razorpaySignature });
  if (!valid) throw new ApiError(400, "Payment signature verification failed");

  await completeFinePayment(booking);

  res.status(200).json(new ApiResponse(200, { booking }, "Fine paid — checkout complete"));
});

const completeFinePayment = async (booking) => {
  booking.paymentStatus = PAYMENT_STATUS.FINE_PAID;
  booking.checkedOutAt = booking.checkedOutAt || new Date();
  await booking.save();

  await transition(booking, BOOKING_STATUS.COMPLETED, {
    reason: "Overdue fine paid",
    notification: {
      type: NOTIFICATION_TYPES.PAYMENT_SUCCESS,
      title: "Fine paid — checkout complete",
      body: `Thanks for paying the overdue fine for booking ${booking.bookingRef}. Checkout is now complete.`,
    },
  });

  emitToUser(booking.user, "payment:success", { bookingId: booking._id });
  emitToBooking(booking._id, "payment:success", { bookingId: booking._id });

  generateInvoice(booking).catch(() => null);
  grantReferralRewardIfEligible(booking.user).catch(() => null);

  return booking;
};

// POST /payments/webhook — Razorpay webhook (mounted with express.raw() in app.js)
export const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const rawBody = req.body; // Buffer, thanks to express.raw()

  if (process.env.NODE_ENV === "production" || process.env.RAZORPAY_WEBHOOK_SECRET) {
    const valid = verifyWebhookSignature(rawBody, signature);
    if (!valid) throw new ApiError(400, "Invalid webhook signature");
  }

  const event = JSON.parse(rawBody.toString());
  const eventType = event.event;
  const paymentEntity = event.payload?.payment?.entity;
  const orderId = paymentEntity?.order_id;
  const paymentId = paymentEntity?.id;

  if (["payment.captured", "qr_code.credited", "payment_link.paid"].includes(eventType) && orderId) {
    const booking =
      (await Booking.findOne({ razorpayOrderId: orderId })) || (await Booking.findOne({ fineRazorpayOrderId: orderId }));

    if (booking) {
      if (booking.fineRazorpayOrderId === orderId && booking.status === BOOKING_STATUS.OVERDUE) {
        await completeFinePayment(booking);
      } else if (booking.status === BOOKING_STATUS.ACCEPTED) {
        await markBookingPaid(booking, paymentId);
      }
    }
  }

  if (eventType === "payment.failed" && orderId) {
    const booking = await Booking.findOne({ razorpayOrderId: orderId });
    if (booking && booking.status === BOOKING_STATUS.ACCEPTED) {
      booking.paymentStatus = PAYMENT_STATUS.FAILED;
      await booking.save();
      await sendNotification(booking.user, {
        type: NOTIFICATION_TYPES.PAYMENT_FAILED,
        title: "Payment failed",
        body: `Payment for booking ${booking.bookingRef} failed. You can retry from your bookings page.`,
        data: { bookingId: String(booking._id) },
      });
    }
  }

  // Webhooks are the source of truth — always 200 quickly so Razorpay stops retrying.
  res.status(200).json({ received: true });
});

export default {
  createBookingOrder,
  verifyBookingPayment,
  createBookingQr,
  mockCompletePayment,
  createFineOrder,
  verifyFinePayment,
  handleWebhook,
};
