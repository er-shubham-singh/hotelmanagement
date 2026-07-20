import { config } from "../config/env.js";

// In-memory OTP store keyed by phone number. Fine for a single-instance dev/demo
// deployment; swap for Redis if this ever needs to scale horizontally.
const otpStore = new Map();

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;

const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

export const issueOtp = (phone) => {
  const existing = otpStore.get(phone);
  if (existing && Date.now() - existing.issuedAt < RESEND_COOLDOWN_MS) {
    const waitMs = RESEND_COOLDOWN_MS - (Date.now() - existing.issuedAt);
    return { throttled: true, waitMs };
  }

  const code = generateCode();
  otpStore.set(phone, { code, issuedAt: Date.now(), expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 });

  // Mock delivery: in production this would call an SMS gateway (e.g. Twilio/MSG91).
  // eslint-disable-next-line no-console
  console.log(`[otp] Mock SMS to ${phone}: your StayByHour OTP is ${code} (valid 5 min)`);

  return { throttled: false, code: config.nodeEnv === "development" ? code : undefined };
};

export const verifyOtpCode = (phone, code) => {
  const entry = otpStore.get(phone);
  if (!entry) return { valid: false, reason: "OTP not requested or expired" };
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    return { valid: false, reason: "OTP expired" };
  }
  entry.attempts += 1;
  if (entry.attempts > 5) {
    otpStore.delete(phone);
    return { valid: false, reason: "Too many attempts, request a new OTP" };
  }
  if (entry.code !== code) {
    return { valid: false, reason: "Incorrect OTP" };
  }

  otpStore.delete(phone);
  return { valid: true };
};

export default { issueOtp, verifyOtpCode };
