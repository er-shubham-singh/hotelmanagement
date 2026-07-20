import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true, index: true },
    type: { type: String, required: true, trim: true }, // e.g. "Deluxe Room", "Executive Suite"
    capacity: {
      adults: { type: Number, default: 2, min: 1 },
      children: { type: Number, default: 0, min: 0 },
    },
    images: [{ type: String }],
    amenities: [{ type: String }],
    priceSlots: {
      threeHr: { type: Number, default: null },
      sixHr: { type: Number, default: null },
      twelveHr: { type: Number, default: null },
      fullDay: { type: Number, default: null },
    },
    totalUnits: { type: Number, default: 1, min: 0 }, // number of physical rooms of this type
    availabilityRules: {
      // simple day-of-week blackout / custom rules can be added here later
      blackoutDates: [{ type: Date }],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

roomSchema.index({ hotel: 1, isActive: 1 });

export const Room = mongoose.model("Room", roomSchema);

export default Room;
