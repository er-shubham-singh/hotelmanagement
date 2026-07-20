import dayjs from "dayjs";
import { User } from "../models/user.model.js";
import { Hotel } from "../models/hotel.model.js";
import { Room } from "../models/room.model.js";
import { Booking } from "../models/booking.model.js";
import { PartnerLead } from "../models/partnerLead.model.js";
import { Offer } from "../models/offer.model.js";
import { AuditLog } from "../models/auditLog.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { BOOKING_STATUS, PAYMENT_STATUS, LEAD_STATUS, ROLES, NOTIFICATION_TYPES } from "../config/constants.js";
import { logAudit } from "../services/audit.service.js";
import { creditWallet } from "./wallet.controller.js";
import { sendNotification } from "../notifications/notification.service.js";
import { verifyCode, isCodeUsable, issueAccessCode } from "../services/accessCode.service.js";
import { performCheckIn, performCheckOut } from "../services/checkin.service.js";
import { sendCheckInCodeEmail, sendCheckOutCodeEmail } from "../services/email.service.js";

const OCCUPYING_STATUSES = [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.ACTIVE, BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.OVERDUE];

// Admins manage every booking; hotel owners are scoped to bookings at hotels they own.
const assertStaffAccess = async (booking, user) => {
  if (user.role === ROLES.ADMIN) return;
  if (user.role === ROLES.HOTEL_OWNER) {
    const hotel = await Hotel.findById(booking.hotel).select("owner");
    if (hotel?.owner?.toString() === user._id.toString()) return;
  }
  throw new ApiError(403, "You do not have access to this booking");
};

// GET /admin/stats — admin sees platform-wide numbers; hotelOwner sees only their own hotels.
export const getDashboardStats = asyncHandler(async (req, res) => {
  const isOwner = req.user.role === ROLES.HOTEL_OWNER;
  const hotelFilter = isOwner ? { owner: req.user._id } : {};
  const ownedHotelIds = isOwner ? (await Hotel.find(hotelFilter).select("_id")).map((h) => h._id) : null;
  const bookingHotelFilter = isOwner ? { hotel: { $in: ownedHotelIds } } : {};

  const startOfDay = dayjs().startOf("day").toDate();
  const endOfDay = dayjs().endOf("day").toDate();

  const [
    totalUsers,
    totalHotels,
    totalBookings,
    activeOffers,
    newLeads,
    revenueAgg,
    penaltyAgg,
    occupiedUnitsAgg,
    totalUnitsAgg,
    todayCheckIns,
    todayCheckOuts,
  ] = await Promise.all([
    isOwner ? Promise.resolve(null) : User.countDocuments({ role: ROLES.USER }),
    Hotel.countDocuments({ ...hotelFilter, isActive: true }),
    Booking.countDocuments(bookingHotelFilter),
    isOwner ? Promise.resolve(null) : Offer.countDocuments({ isActive: true }),
    isOwner ? Promise.resolve(null) : PartnerLead.countDocuments({ status: LEAD_STATUS.NEW }),
    Booking.aggregate([
      { $match: { ...bookingHotelFilter, status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.OVERDUE] } } },
      { $group: { _id: null, total: { $sum: "$priceBreakdown.payable" } } },
    ]),
    Booking.aggregate([
      { $match: { ...bookingHotelFilter, status: BOOKING_STATUS.OVERDUE } },
      { $group: { _id: null, total: { $sum: "$penaltyAmount" } } },
    ]),
    Booking.aggregate([
      { $match: { ...bookingHotelFilter, status: { $in: OCCUPYING_STATUSES }, checkInAt: { $lte: new Date() }, checkOutAt: { $gt: new Date() } } },
      { $group: { _id: null, total: { $sum: "$rooms" } } },
    ]),
    Room.aggregate([
      { $match: { isActive: true, ...(isOwner ? { hotel: { $in: ownedHotelIds } } : {}) } },
      { $group: { _id: null, total: { $sum: "$totalUnits" } } },
    ]),
    Booking.countDocuments({ ...bookingHotelFilter, checkInAt: { $gte: startOfDay, $lte: endOfDay }, status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.ACTIVE, BOOKING_STATUS.CHECKED_IN] } }),
    Booking.countDocuments({ ...bookingHotelFilter, checkOutAt: { $gte: startOfDay, $lte: endOfDay }, status: { $in: [BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.OVERDUE, BOOKING_STATUS.COMPLETED] } }),
  ]);

  const totalUnits = totalUnitsAgg[0]?.total || 0;
  const occupiedUnits = occupiedUnitsAgg[0]?.total || 0;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalUsers,
        totalHotels,
        totalBookings,
        activeOffers,
        newLeads,
        totalRevenue: revenueAgg[0]?.total || 0,
        pendingPenalties: penaltyAgg[0]?.total || 0,
        occupancy: { occupiedUnits, totalUnits, percent: totalUnits ? Math.round((occupiedUnits / totalUnits) * 100) : 0 },
        todayCheckIns,
        todayCheckOuts,
      },
      "Dashboard stats fetched"
    )
  );
});

// GET /admin/users
export const listUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const filter = role ? { role } : {};
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Number(limit));

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    User.countDocuments(filter),
  ]);

  res.status(200).json(new ApiResponse(200, { users, total, page: pageNum, pages: Math.ceil(total / limitNum) }, "Users fetched"));
});

// PATCH /admin/users/:id/role
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!Object.values(ROLES).includes(role)) throw new ApiError(400, "Invalid role");

  const previousRole = (await User.findById(req.params.id))?.role;
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) throw new ApiError(404, "User not found");

  logAudit(req.user._id, "user.role.update", "User", user._id, { from: previousRole, to: role });

  res.status(200).json(new ApiResponse(200, { user: user.toSafeObject() }, "User role updated"));
});

// POST /admin/bookings/:id/refund { amount, reason } — manual admin-issued refund to the guest's wallet.
export const issueManualRefund = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body;
  if (!amount || amount <= 0) throw new ApiError(400, "A positive refund amount is required");

  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, "Booking not found");
  await assertStaffAccess(booking, req.user);

  await creditWallet(booking.user, amount, reason || `Manual refund for booking ${booking.bookingRef}`, booking.bookingRef);

  booking.refundAmount = (booking.refundAmount || 0) + Number(amount);
  if (booking.paymentStatus === PAYMENT_STATUS.PAID) booking.paymentStatus = PAYMENT_STATUS.PARTIALLY_REFUNDED;
  await booking.save();

  await sendNotification(booking.user, {
    type: NOTIFICATION_TYPES.REFUND,
    title: "Refund issued",
    body: `₹${amount} has been credited to your wallet for booking ${booking.bookingRef}.`,
    data: { bookingId: String(booking._id) },
  });

  logAudit(req.user._id, "booking.refund.manual", "Booking", booking._id, { amount, reason });

  res.status(200).json(new ApiResponse(200, { booking }, "Refund issued"));
});

// POST /admin/bookings/:id/verify-checkin { code } — front-desk staff enters
// the code the guest shows them; on success the booking moves to CHECKED_IN
// and (via the status engine) a checkout code is issued + emailed.
export const verifyCheckIn = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) throw new ApiError(400, "code is required");

  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, "Booking not found");
  await assertStaffAccess(booking, req.user);

  if (![BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.ACTIVE].includes(booking.status)) {
    throw new ApiError(409, `Booking is ${booking.status} — check-in code is not applicable`);
  }
  if (!isCodeUsable(booking.checkInCode)) {
    throw new ApiError(400, "Check-in code has expired or was already used — resend a new one");
  }
  const valid = await verifyCode(code, booking.checkInCode.hash);
  if (!valid) throw new ApiError(400, "Incorrect check-in code");

  booking.checkInCode.usedAt = new Date();
  booking.checkinVerifiedBy = req.user._id;
  await booking.save();

  await performCheckIn(booking, { reason: `Check-in verified by staff (${req.user.name})` });

  logAudit(req.user._id, "booking.checkin.verified", "Booking", booking._id, {});

  res.status(200).json(new ApiResponse(200, { booking }, "Check-in verified"));
});

// POST /admin/bookings/:id/verify-checkout { code }
export const verifyCheckOut = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) throw new ApiError(400, "code is required");

  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, "Booking not found");
  await assertStaffAccess(booking, req.user);

  if (![BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.OVERDUE].includes(booking.status)) {
    throw new ApiError(409, `Booking is ${booking.status} — check-out code is not applicable`);
  }
  if (!isCodeUsable(booking.checkOutCode)) {
    throw new ApiError(400, "Check-out code has expired or was already used — resend a new one");
  }
  const valid = await verifyCode(code, booking.checkOutCode.hash);
  if (!valid) throw new ApiError(400, "Incorrect check-out code");

  booking.checkOutCode.usedAt = new Date();
  booking.checkoutVerifiedBy = req.user._id;
  await booking.save();

  // performCheckOut throws a 402 (with the booking flipped to OVERDUE) if the
  // grace period has already elapsed — the fine must be paid before this can
  // succeed, exactly like the guest self-service path.
  await performCheckOut(booking, { reason: `Check-out verified by staff (${req.user.name})` });

  logAudit(req.user._id, "booking.checkout.verified", "Booking", booking._id, {});

  res.status(200).json(new ApiResponse(200, { booking }, "Check-out verified — stay completed"));
});

// POST /admin/bookings/:id/resend-code?type=checkin|checkout
export const resendAccessCode = asyncHandler(async (req, res) => {
  const { type } = req.query;
  if (!["checkin", "checkout"].includes(type)) throw new ApiError(400, "type must be 'checkin' or 'checkout'");

  const booking = await Booking.findById(req.params.id).populate("hotel", "name").populate("user", "name email");
  if (!booking) throw new ApiError(404, "Booking not found");
  await assertStaffAccess(booking, req.user);

  const email = booking.user?.email || booking.guest?.email;
  if (!email) throw new ApiError(400, "This guest has no email on file to send the code to");

  const { plaintext, record } = await issueAccessCode();
  const emailData = {
    name: booking.user?.name || booking.guest?.name || "Guest",
    bookingRef: booking.bookingRef,
    hotelName: booking.hotel?.name || "your hotel",
    code: plaintext,
    expiresAt: record.expiresAt,
  };

  if (type === "checkin") {
    booking.checkInCode = record;
    await booking.save();
    await sendCheckInCodeEmail(email, emailData);
  } else {
    booking.checkOutCode = record;
    await booking.save();
    await sendCheckOutCodeEmail(email, emailData);
  }

  logAudit(req.user._id, `booking.${type}code.resend`, "Booking", booking._id, {});

  res.status(200).json(new ApiResponse(200, { expiresAt: record.expiresAt }, `${type === "checkin" ? "Check-in" : "Check-out"} code resent`));
});

// GET /admin/audit-logs
export const listAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Number(limit));

  const [logs, total] = await Promise.all([
    AuditLog.find()
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    AuditLog.countDocuments(),
  ]);

  res.status(200).json(new ApiResponse(200, { logs, total, page: pageNum, pages: Math.ceil(total / limitNum) }, "Audit logs fetched"));
});

export default {
  getDashboardStats,
  listUsers,
  updateUserRole,
  issueManualRefund,
  verifyCheckIn,
  verifyCheckOut,
  resendAccessCode,
  listAuditLogs,
};
