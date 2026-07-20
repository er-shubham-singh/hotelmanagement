import { Offer } from "../models/offer.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { evaluateCoupon } from "../services/coupon.service.js";
import { ROLES } from "../config/constants.js";
import { logAudit } from "../services/audit.service.js";

// GET /offers — guests only see active, unexpired offers; admins (via optionalAuthenticate) see everything for management.
export const listOffers = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === ROLES.ADMIN;
  const filter = isAdmin ? {} : { isActive: true, validTo: { $gte: new Date() } };
  const offers = await Offer.find(filter).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { offers }, "Offers fetched"));
});

// POST /offers/validate { code, amount }
export const validateOffer = asyncHandler(async (req, res) => {
  const { code, amount } = req.body;
  if (!code || amount == null) throw new ApiError(400, "code and amount are required");

  const { offer, discount } = await evaluateCoupon(code, Number(amount));
  res.status(200).json(new ApiResponse(200, { offer, discount }, "Coupon is valid"));
});

// POST /offers (admin)
export const createOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.create(req.body);
  logAudit(req.user._id, "offer.create", "Offer", offer._id, { code: offer.code });
  res.status(201).json(new ApiResponse(201, { offer }, "Offer created"));
});

// PUT /offers/:id (admin)
export const updateOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!offer) throw new ApiError(404, "Offer not found");
  logAudit(req.user._id, "offer.update", "Offer", offer._id, { fields: Object.keys(req.body) });
  res.status(200).json(new ApiResponse(200, { offer }, "Offer updated"));
});

// DELETE /offers/:id (admin)
export const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findByIdAndDelete(req.params.id);
  if (!offer) throw new ApiError(404, "Offer not found");
  logAudit(req.user._id, "offer.delete", "Offer", offer._id, { code: offer.code });
  res.status(200).json(new ApiResponse(200, null, "Offer deleted"));
});

export default { listOffers, validateOffer, createOffer, updateOffer, deleteOffer };
