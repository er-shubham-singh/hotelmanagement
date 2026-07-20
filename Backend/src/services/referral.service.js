import crypto from "crypto";
import { User } from "../models/user.model.js";
import { Booking } from "../models/booking.model.js";
import { NOTIFICATION_TYPES, BOOKING_STATUS } from "../config/constants.js";
import { creditWallet } from "../controllers/wallet.controller.js";
import { sendNotification } from "../notifications/notification.service.js";

const REFERRAL_REWARD = 150; // ₹ credited to both referrer and referee

export const generateReferralCode = async (name) => {
  const base = (name || "USER").replace(/[^a-zA-Z]/g, "").slice(0, 5).toUpperCase() || "USER";
  let code;
  let exists = true;
  while (exists) {
    code = `${base}${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
    // eslint-disable-next-line no-await-in-loop
    exists = await User.exists({ referralCode: code });
  }
  return code;
};

// Called after a booking reaches COMPLETED. If this is the referee's first
// completed stay and they were referred, credit both parties once.
export const grantReferralRewardIfEligible = async (userId) => {
  const user = await User.findById(userId);
  if (!user?.referredBy || user.referralRewardGranted) return;

  const completedCount = await Booking.countDocuments({ user: userId, status: BOOKING_STATUS.COMPLETED });
  if (completedCount !== 1) return; // only the very first completed booking triggers it

  await creditWallet(user._id, REFERRAL_REWARD, "Referral reward — first completed booking");
  await creditWallet(user.referredBy, REFERRAL_REWARD, "Referral reward — your friend completed their first booking");

  user.referralRewardGranted = true;
  await user.save();

  await sendNotification(user._id, {
    type: NOTIFICATION_TYPES.REFERRAL_REWARD,
    title: "Referral bonus credited!",
    body: `₹${REFERRAL_REWARD} has been added to your wallet for completing your first booking.`,
  });
  await sendNotification(user.referredBy, {
    type: NOTIFICATION_TYPES.REFERRAL_REWARD,
    title: "Referral bonus credited!",
    body: `₹${REFERRAL_REWARD} has been added to your wallet — your referred friend completed their first booking.`,
  });
};

export default { generateReferralCode, grantReferralRewardIfEligible };
