// In-memory OTP store keyed by an arbitrary identifier (phone number or email
// address — the store itself doesn't care which). Fine for a single-instance
// dev/demo deployment; swap for Redis if this ever needs to scale horizontally.
const otpStore = new Map();

// Separate short-lived store for "this email completed OTP verification" —
// consulted by registerWithEmail so the password-setup step can only be
// reached after a real OTP round-trip, without re-sending a fresh code.
const verifiedStore = new Map();
const VERIFIED_TTL_MS = 15 * 60 * 1000;

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;

const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

// `key` is a phone number or an email address — caller decides which channel
// to actually deliver the code over (SMS mock console log vs a real email).
export const issueOtp = (key) => {
  const existing = otpStore.get(key);
  if (existing && Date.now() - existing.issuedAt < RESEND_COOLDOWN_MS) {
    const waitMs = RESEND_COOLDOWN_MS - (Date.now() - existing.issuedAt);
    return { throttled: true, waitMs };
  }

  const code = generateCode();
  otpStore.set(key, { code, issuedAt: Date.now(), expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 });

  // eslint-disable-next-line no-console
  console.log(`[otp] Code for ${key}: ${code} (valid 5 min)`);

  // Always returns the real code — callers decide whether it's safe to put in
  // an HTTP response (phone flow does, gated by NODE_ENV) or whether it must
  // only ever be delivered out-of-band (email flow: emailed, never returned).
  return { throttled: false, code };
};

export const verifyOtpCode = (key, code) => {
  const entry = otpStore.get(key);
  if (!entry) return { valid: false, reason: "OTP not requested or expired" };
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(key);
    return { valid: false, reason: "OTP expired" };
  }
  entry.attempts += 1;
  if (entry.attempts > 5) {
    otpStore.delete(key);
    return { valid: false, reason: "Too many attempts, request a new OTP" };
  }
  if (entry.code !== code) {
    return { valid: false, reason: "Incorrect OTP" };
  }

  otpStore.delete(key);
  return { valid: true };
};

// Marks `key` (an email address) as having just passed OTP verification, so a
// subsequent registration step can check it without requiring the OTP again.
export const markVerified = (key) => {
  verifiedStore.set(key, Date.now() + VERIFIED_TTL_MS);
};

export const isVerified = (key) => {
  const expiresAt = verifiedStore.get(key);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    verifiedStore.delete(key);
    return false;
  }
  return true;
};

export const clearVerified = (key) => {
  verifiedStore.delete(key);
};

export default { issueOtp, verifyOtpCode, markVerified, isVerified, clearVerified };
