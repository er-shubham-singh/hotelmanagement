import { Wallet } from "../models/wallet.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// GET /wallet
export const getWallet = asyncHandler(async (req, res) => {
  let wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) {
    wallet = await Wallet.create({ user: req.user._id, balance: 0, transactions: [] });
  }
  res.status(200).json(new ApiResponse(200, { wallet }, "Wallet fetched"));
});

// Internal helper used by booking/coupon flows — not a route handler.
export const creditWallet = async (userId, amount, reason, ref = null) => {
  if (amount <= 0) return;
  const wallet = await Wallet.findOneAndUpdate(
    { user: userId },
    { $inc: { balance: amount }, $push: { transactions: { type: "credit", amount, reason, ref } } },
    { new: true, upsert: true }
  );
  return wallet;
};

export const debitWallet = async (userId, amount, reason, ref = null) => {
  if (amount <= 0) return;
  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet || wallet.balance < amount) {
    throw new ApiError(400, "Insufficient wallet balance");
  }
  wallet.balance -= amount;
  wallet.transactions.push({ type: "debit", amount, reason, ref });
  await wallet.save();
  return wallet;
};

export default { getWallet, creditWallet, debitWallet };
