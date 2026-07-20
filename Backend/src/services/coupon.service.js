import { Offer } from "../models/offer.model.js";
import { ApiError } from "../utils/ApiError.js";
import { OFFER_TYPES } from "../config/constants.js";

// Validates a coupon code against the order amount and returns the discount in ₹.
// Does not mark the coupon as used — call incrementUsage() only after a booking is confirmed.
export const evaluateCoupon = async (code, amount) => {
  if (!code) return { offer: null, discount: 0 };

  const offer = await Offer.findOne({ code: code.toUpperCase(), isActive: true });
  if (!offer) throw new ApiError(404, "Invalid coupon code");

  const now = new Date();
  if (now < offer.validFrom || now > offer.validTo) {
    throw new ApiError(400, "This coupon has expired");
  }
  if (offer.usageLimit !== null && offer.usedCount >= offer.usageLimit) {
    throw new ApiError(400, "This coupon has reached its usage limit");
  }
  if (amount < offer.minBooking) {
    throw new ApiError(400, `Minimum booking amount for this coupon is ₹${offer.minBooking}`);
  }

  let discount = offer.type === OFFER_TYPES.FLAT ? offer.value : Math.round((amount * offer.value) / 100);
  if (offer.maxDiscount) discount = Math.min(discount, offer.maxDiscount);
  discount = Math.min(discount, amount);

  return { offer, discount };
};

export const incrementUsage = async (offerId) => {
  await Offer.findByIdAndUpdate(offerId, { $inc: { usedCount: 1 } });
};

export default { evaluateCoupon, incrementUsage };
