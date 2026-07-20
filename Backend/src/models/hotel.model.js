import mongoose from "mongoose";
import slugify from "slugify";
import { HOTEL_TAGS } from "../config/constants.js";

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    city: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
    area: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    geo: {
      lat: { type: Number },
      lng: { type: Number },
    },
    description: { type: String, default: "" },
    images: [{ type: String }],
    amenities: [{ type: String }], // e.g. wifi, ac, tv, water, parking, breakfast
    tags: [{ type: String, enum: Object.values(HOTEL_TAGS) }],
    starCategory: { type: Number, min: 1, max: 5, default: 3 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

hotelSchema.index({ city: 1, isActive: 1 });
hotelSchema.index({ name: "text", area: "text", description: "text" });

hotelSchema.pre("validate", function preValidate(next) {
  if (this.name && !this.slug) {
    const suffix = Math.random().toString(36).slice(2, 7);
    this.slug = `${slugify(this.name, { lower: true, strict: true })}-${suffix}`;
  }
  next();
});

export const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;
