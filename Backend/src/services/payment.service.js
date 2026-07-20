import crypto from "crypto";
import QRCode from "qrcode";
import { razorpay, isRazorpayConfigured } from "../config/razorpay.js";
import { config } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

// In mock mode (no Razorpay keys configured) we simulate order/payment-link
// creation locally so the whole booking → pay → confirm flow still works
// end-to-end in development without a real gateway account.
const mockId = (prefix) => `${prefix}_mock_${crypto.randomBytes(8).toString("hex")}`;

export const createOrder = async ({ amountRupees, receipt, notes = {} }) => {
  const amountPaise = Math.round(amountRupees * 100);

  if (!isRazorpayConfigured) {
    return { id: mockId("order"), amount: amountPaise, currency: "INR", receipt, mock: true };
  }

  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt,
    notes,
  });
  return { ...order, mock: false };
};

export const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  if (!isRazorpayConfigured) {
    // Mock mode: any payment against a mock order id verifies successfully.
    return orderId?.startsWith("order_mock_");
  }

  const expected = crypto
    .createHmac("sha256", config.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expected === signature;
};

export const verifyWebhookSignature = (rawBody, signature) => {
  if (!config.razorpay.webhookSecret) return false;
  const expected = crypto.createHmac("sha256", config.razorpay.webhookSecret).update(rawBody).digest("hex");
  return expected === signature;
};

// Generates a shareable payment link + QR code image (data URL) for a booking
// so anyone — not just the logged-in user — can pay on their behalf.
export const createPaymentLinkWithQr = async ({ amountRupees, description, referenceId, notes = {} }) => {
  const amountPaise = Math.round(amountRupees * 100);

  let linkId;
  let shortUrl;

  if (!isRazorpayConfigured) {
    linkId = mockId("plink");
    shortUrl = `${config.clientUrl}/pay/mock/${linkId}`;
  } else {
    const link = await razorpay.paymentLink.create({
      amount: amountPaise,
      currency: "INR",
      description,
      reference_id: referenceId,
      notes,
      callback_url: `${config.clientUrl}/booking-confirmation/${referenceId}`,
      callback_method: "get",
    });
    linkId = link.id;
    shortUrl = link.short_url;
  }

  const qrDataUrl = await QRCode.toDataURL(shortUrl);

  return { linkId, url: shortUrl, qrDataUrl, mock: !isRazorpayConfigured };
};

export const refundPayment = async ({ paymentId, amountRupees }) => {
  if (!isRazorpayConfigured || !paymentId || paymentId.startsWith("pay_mock_")) {
    return { id: mockId("rfnd"), amount: Math.round(amountRupees * 100), mock: true };
  }

  try {
    const refund = await razorpay.payments.refund(paymentId, { amount: Math.round(amountRupees * 100) });
    return { ...refund, mock: false };
  } catch (error) {
    throw new ApiError(502, `Refund failed: ${error.message}`);
  }
};

export default { createOrder, verifyPaymentSignature, verifyWebhookSignature, createPaymentLinkWithQr, refundPayment };
