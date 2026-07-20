import { PartnerLead } from "../models/partnerLead.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../services/email.service.js";
import { config } from "../config/env.js";

// POST /partner/leads — "List Your Hotel" lead form
export const createPartnerLead = asyncHandler(async (req, res) => {
  const { name, hotelName, city, phone, email, message } = req.body;
  if (!name || !hotelName || !city || !phone) {
    throw new ApiError(400, "name, hotelName, city, and phone are required");
  }

  const lead = await PartnerLead.create({ name, hotelName, city, phone, email, message });

  await sendEmail({
    to: config.mailFrom,
    subject: `New partner lead: ${hotelName} (${city})`,
    text: `Name: ${name}\nHotel: ${hotelName}\nCity: ${city}\nPhone: ${phone}\nEmail: ${email || "-"}\nMessage: ${message || "-"}`,
  }).catch(() => null); // lead is already saved; email failures shouldn't fail the request

  res.status(201).json(new ApiResponse(201, { lead }, "Thanks! Our partnerships team will reach out shortly."));
});

// GET /partner/leads (admin)
export const listPartnerLeads = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const leads = await PartnerLead.find(filter).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { leads }, "Leads fetched"));
});

// PATCH /partner/leads/:id (admin)
export const updatePartnerLeadStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const lead = await PartnerLead.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!lead) throw new ApiError(404, "Lead not found");
  res.status(200).json(new ApiResponse(200, { lead }, "Lead updated"));
});

// POST /contact — general contact form
export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) throw new ApiError(400, "name, email, and message are required");

  await sendEmail({
    to: config.mailFrom,
    subject: `Contact form: ${subject || "New message"} — from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });

  res.status(200).json(new ApiResponse(200, null, "Thanks for reaching out — we'll get back to you soon."));
});

export default { createPartnerLead, listPartnerLeads, updatePartnerLeadStatus, submitContact };
