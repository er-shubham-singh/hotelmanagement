import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true },
    ref: { type: String }, // e.g. bookingRef or coupon code that triggered it
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const walletSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, default: 0, min: 0 },
    transactions: [transactionSchema],
  },
  { timestamps: true }
);

export const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;
