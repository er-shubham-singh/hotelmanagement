import mongoose from "mongoose";
import { LEAD_STATUS } from "../config/constants.js";

const partnerLeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    hotelName: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    message: { type: String, default: "" },
    status: { type: String, enum: Object.values(LEAD_STATUS), default: LEAD_STATUS.NEW },
  },
  { timestamps: true }
);

export const PartnerLead = mongoose.model("PartnerLead", partnerLeadSchema);

export default PartnerLead;
