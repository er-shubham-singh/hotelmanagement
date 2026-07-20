import mongoose from "mongoose";
import slugify from "slugify";

const citySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true, index: true },
    state: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    heroImage: { type: String, default: "" },
    hotelCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

citySchema.pre("validate", function preValidate(next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export const City = mongoose.model("City", citySchema);

export default City;
