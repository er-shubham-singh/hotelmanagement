import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES, AUTH_PROVIDERS } from "../config/constants.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Google-only accounts may have no phone number yet
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    passwordHash: { type: String, select: false },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hotel" }],
    wallet: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    // Only relevant when role === hotelOwner
    ownedHotels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hotel" }],

    // FCM web/device push tokens (a user may be logged in on multiple devices)
    deviceTokens: [{ type: String }],

    // Referral & cashback
    referralCode: { type: String, unique: true, sparse: true, index: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    referralRewardGranted: { type: Boolean, default: false },

    // Google sign-in
    googleId: { type: String, unique: true, sparse: true, index: true },
    authProvider: { type: String, enum: Object.values(AUTH_PROVIDERS), default: AUTH_PROVIDERS.LOCAL },
    avatar: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export const User = mongoose.model("User", userSchema);

export default User;
