import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { Wallet } from "../models/wallet.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/generateTokens.js";
import { parseDuration } from "../utils/parseDuration.js";
import { config } from "../config/env.js";
import { issueOtp, verifyOtpCode, markVerified, isVerified, clearVerified } from "../services/otp.service.js";
import { sendEmailOtpEmail } from "../services/email.service.js";
import { generateReferralCode } from "../services/referral.service.js";
import { verifyGoogleIdToken } from "../notifications/firebase.js";
import { AUTH_PROVIDERS } from "../config/constants.js";

const REFRESH_COOKIE_NAME = "refreshToken";

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: config.nodeEnv === "production" ? "none" : "lax",
  maxAge: parseDuration(config.jwt.refreshExpiry, 7 * 24 * 60 * 60 * 1000),
  path: "/api/v1/auth",
});

const issueSession = async (res, user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  return accessToken;
};

const createWalletFor = async (userId) => {
  const wallet = await Wallet.create({ user: userId, balance: 0, transactions: [] });
  await User.findByIdAndUpdate(userId, { wallet: wallet._id });
  return wallet;
};

// Resolves an incoming referral code to a referrer id, if valid. Never throws
// on a bad/missing code — referral is a nice-to-have, not a signup blocker.
const resolveReferrer = async (referralCode) => {
  if (!referralCode) return null;
  const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
  return referrer?._id || null;
};

// POST /auth/send-otp { phone }
export const sendOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) throw new ApiError(400, "Phone number is required");

  const result = issueOtp(phone);
  if (result.throttled) {
    throw new ApiError(429, `Please wait before requesting another OTP (${Math.ceil(result.waitMs / 1000)}s)`);
  }

  res.status(200).json(
    new ApiResponse(
      200,
      config.nodeEnv === "development" ? { devOtp: result.code } : null,
      "OTP sent successfully"
    )
  );
});

// POST /auth/verify-otp { phone, code, name?, referralCode? } — logs the user in, auto-registering on first use.
export const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, code, name, referralCode } = req.body;
  if (!phone || !code) throw new ApiError(400, "Phone and code are required");

  const result = verifyOtpCode(phone, code);
  if (!result.valid) throw new ApiError(400, result.reason);

  let user = await User.findOne({ phone });
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    const [ownReferralCode, referredBy] = await Promise.all([
      generateReferralCode(name || phone),
      resolveReferrer(referralCode),
    ]);
    user = await User.create({ name: name || "Guest", phone, isPhoneVerified: true, referralCode: ownReferralCode, referredBy });
    await createWalletFor(user._id);
  } else if (!user.isPhoneVerified) {
    user.isPhoneVerified = true;
    await user.save();
  }

  const accessToken = await issueSession(res, user);

  res.status(200).json(
    new ApiResponse(200, { user: user.toSafeObject(), accessToken, isNewUser }, "Logged in successfully")
  );
});

// POST /auth/email/send-otp { email } — email signup, step 1. The code is
// NEVER put in the response (unlike the phone flow's dev-mode devOtp) — it is
// only ever delivered by email, so it's never visible on-screen.
export const sendEmailOtp = asyncHandler(async (req, res) => {
  const email = req.body.email?.toLowerCase();
  if (!email) throw new ApiError(400, "Email is required");

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "An account with this email already exists — please login instead");

  const result = issueOtp(email);
  if (result.throttled) {
    throw new ApiError(429, `Please wait before requesting another OTP (${Math.ceil(result.waitMs / 1000)}s)`);
  }

  await sendEmailOtpEmail(email, { code: result.code });

  res.status(200).json(new ApiResponse(200, null, "OTP sent to your email"));
});

// POST /auth/email/verify-otp { email, code } — email signup, step 2. Marks
// the email as verified (15 min window) so registerWithEmail can finish
// account creation without requiring the OTP a second time.
export const verifyEmailOtp = asyncHandler(async (req, res) => {
  const email = req.body.email?.toLowerCase();
  const { code } = req.body;
  if (!email || !code) throw new ApiError(400, "Email and code are required");

  const result = verifyOtpCode(email, code);
  if (!result.valid) throw new ApiError(400, result.reason);

  markVerified(email);
  res.status(200).json(new ApiResponse(200, null, "Email verified"));
});

// POST /auth/email/register { name, email, password, referralCode? } — email
// signup, step 3. Only succeeds if this email just passed verifyEmailOtp.
export const registerWithEmail = asyncHandler(async (req, res) => {
  const { name, password, referralCode } = req.body;
  const email = req.body.email?.toLowerCase();
  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }
  if (!isVerified(email)) {
    throw new ApiError(400, "Please verify your email with the OTP before setting a password");
  }

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "An account with this email already exists");

  const [passwordHash, ownReferralCode, referredBy] = await Promise.all([
    bcrypt.hash(password, 10),
    generateReferralCode(name),
    resolveReferrer(referralCode),
  ]);
  const user = await User.create({
    name,
    email,
    passwordHash,
    isEmailVerified: true,
    authProvider: AUTH_PROVIDERS.LOCAL,
    referralCode: ownReferralCode,
    referredBy,
  });
  await createWalletFor(user._id);
  clearVerified(email);

  const accessToken = await issueSession(res, user);

  res.status(201).json(new ApiResponse(201, { user: user.toSafeObject(), accessToken }, "Account created"));
});

// POST /auth/register { name, email, phone, password, referralCode? }
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, referralCode } = req.body;
  if (!name || !phone || !password) {
    throw new ApiError(400, "Name, phone, and password are required");
  }

  const existing = await User.findOne({ $or: [{ phone }, ...(email ? [{ email }] : [])] });
  if (existing) throw new ApiError(409, "An account with this phone or email already exists");

  const [passwordHash, ownReferralCode, referredBy] = await Promise.all([
    bcrypt.hash(password, 10),
    generateReferralCode(name),
    resolveReferrer(referralCode),
  ]);
  const user = await User.create({ name, email, phone, passwordHash, referralCode: ownReferralCode, referredBy });
  await createWalletFor(user._id);

  const accessToken = await issueSession(res, user);

  res.status(201).json(new ApiResponse(201, { user: user.toSafeObject(), accessToken }, "Account created"));
});

// POST /auth/login { identifier, password } — identifier is email or phone
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) throw new ApiError(400, "Identifier and password are required");

  const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] }).select("+passwordHash");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid credentials");
  }
  if (!user.isActive) throw new ApiError(403, "This account has been deactivated");

  const accessToken = await issueSession(res, user);

  res.status(200).json(new ApiResponse(200, { user: user.toSafeObject(), accessToken }, "Logged in successfully"));
});

// POST /auth/google { idToken, referralCode? } — Firebase ID token from the
// frontend's "Continue with Google" popup. Links to an existing account by
// email if one exists, otherwise creates a new Google-provider user.
export const googleLogin = asyncHandler(async (req, res) => {
  const { idToken, referralCode } = req.body;
  if (!idToken) throw new ApiError(400, "idToken is required");

  let decoded;
  try {
    decoded = await verifyGoogleIdToken(idToken);
  } catch (error) {
    throw new ApiError(401, `Google sign-in verification failed: ${error.message}`);
  }

  const { email, name, picture, uid } = decoded;
  if (!email) throw new ApiError(400, "This Google account has no email on file");

  let user = await User.findOne({ $or: [{ googleId: uid }, { email }] });
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    const [ownReferralCode, referredBy] = await Promise.all([
      generateReferralCode(name || email),
      resolveReferrer(referralCode),
    ]);
    user = await User.create({
      name: name || email.split("@")[0],
      email,
      googleId: uid,
      authProvider: AUTH_PROVIDERS.GOOGLE,
      avatar: picture || null,
      isEmailVerified: true,
      referralCode: ownReferralCode,
      referredBy,
    });
    await createWalletFor(user._id);
  } else {
    // Account linking — an existing phone/local account signing in with
    // Google for the first time just gets the Google identity attached.
    let dirty = false;
    if (!user.googleId) {
      user.googleId = uid;
      dirty = true;
    }
    if (!user.avatar && picture) {
      user.avatar = picture;
      dirty = true;
    }
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      dirty = true;
    }
    if (dirty) await user.save();
  }

  if (!user.isActive) throw new ApiError(403, "This account has been deactivated");

  const accessToken = await issueSession(res, user);

  res.status(200).json(
    new ApiResponse(200, { user: user.toSafeObject(), accessToken, isNewUser }, "Logged in with Google")
  );
});

// POST /auth/refresh — reads httpOnly refresh cookie, issues new access token
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) throw new ApiError(401, "No refresh token provided");

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) throw new ApiError(401, "User no longer exists");

  const accessToken = await issueSession(res, user);

  res.status(200).json(new ApiResponse(200, { accessToken }, "Token refreshed"));
});

// POST /auth/logout
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { ...refreshCookieOptions(), maxAge: 0 });
  res.status(200).json(new ApiResponse(200, null, "Logged out"));
});

// GET /auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { user: req.user.toSafeObject() }, "Current user"));
});

export default {
  sendOtp,
  verifyOtp,
  sendEmailOtp,
  verifyEmailOtp,
  registerWithEmail,
  register,
  login,
  googleLogin,
  refresh,
  logout,
  getMe,
};
