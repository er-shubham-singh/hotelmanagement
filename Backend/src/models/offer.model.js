import mongoose from "mongoose";
import { OFFER_TYPES } from "../config/constants.js";

const offerSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    type: { type: String, enum: Object.values(OFFER_TYPES), required: true },
    value: { type: Number, required: true, min: 0 }, // flat ₹ amount or % depending on type
    maxDiscount: { type: Number, default: null }, // cap for percent-type offers
    minBooking: { type: Number, default: 0 },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    usageLimit: { type: Number, default: null }, // null = unlimited, across all users
    usedCount: { type: Number, default: 0 },
    usageLimitPerUser: { type: Number, default: 1 }, // null = unlimited per user; how many times ONE user may use this code
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
