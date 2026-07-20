import Razorpay from "razorpay";
import { config } from "./env.js";

export const isRazorpayConfigured = Boolean(config.razorpay.keyId && config.razorpay.keySecret);

let instance = null;

if (isRazorpayConfigured) {
  instance = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
} else {
  // eslint-disable-next-line no-console
  console.warn(
    "[razorpay] RAZORPAY_KEY_ID/SECRET not set — running in mock-payment mode. " +
      "Orders/QR codes are simulated locally and 'payments' auto-succeed; no real gateway is called."
  );
}

export const razorpay = instance;

export default razorpay;
