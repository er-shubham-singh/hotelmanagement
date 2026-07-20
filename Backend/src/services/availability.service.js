import dayjs from "dayjs";
import mongoose from "mongoose";
import { Room } from "../models/room.model.js";
import { Booking } from "../models/booking.model.js";
import { ApiError } from "../utils/ApiError.js";
import { BOOKING_STATUS } from "../config/constants.js";

// Bookings in these statuses occupy a physical room and must be counted
// against capacity. Terminal states (COMPLETED/CANCELLED/EXPIRED/NO_SHOW)
// are excluded, which is exactly what releases the slot — no manual
// counter bookkeeping needed anywhere else.
const HOLDING_STATUSES = [
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.ACTIVE,
  BOOKING_STATUS.CHECKED_IN,
  BOOKING_STATUS.OVERDUE,
];

/** Computes the [checkInAt, checkOutAt) window for a stay. */
export const computeStayWindow = (checkInDate, checkInTime, durationHrs) => {
  const [hh, mm] = String(checkInTime).split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) {
    throw new ApiError(400, "Invalid check-in time — expected HH:mm");
  }

  const checkInAt = dayjs(checkInDate).hour(hh).minute(mm).second(0).millisecond(0);
  const checkOutAt = checkInAt.add(Number(durationHrs), "hour");

  return { checkInAt: checkInAt.toDate(), checkOutAt: checkOutAt.toDate() };
};

/**
 * Returns how many units of a room are available for the given time window.
 * ACCEPTED (unpaid, held) bookings count too, but only while their hold
 * hasn't expired — an expired-but-not-yet-swept hold never blocks capacity.
 * Pass `excludeBookingId` when re-checking availability for a booking that's
 * about to be rescheduled, so it doesn't block its own new slot.
 */
export const getAvailableUnits = async (roomId, checkInAt, checkOutAt, { excludeBookingId } = {}) => {
  const room = await Room.findById(roomId);
  if (!room) throw new ApiError(404, "Room not found");

  const now = new Date();

  const overlapping = await Booking.aggregate([
    {
      $match: {
        room: room._id,
        checkInAt: { $lt: checkOutAt },
        checkOutAt: { $gt: checkInAt },
        ...(excludeBookingId ? { _id: { $ne: new mongoose.Types.ObjectId(String(excludeBookingId)) } } : {}),
        $or: [
          { status: { $in: HOLDING_STATUSES } },
          { status: BOOKING_STATUS.ACCEPTED, holdExpiresAt: { $gt: now } },
        ],
      },
    },
    { $group: { _id: null, bookedUnits: { $sum: "$rooms" } } },
  ]);

  const bookedUnits = overlapping[0]?.bookedUnits || 0;
  const available = Math.max(0, room.totalUnits - bookedUnits);

  return { totalUnits: room.totalUnits, bookedUnits, available };
};

/** Throws a 409 ApiError if fewer than `roomsRequested` units are free for the window. */
export const assertAvailable = async (roomId, checkInAt, checkOutAt, roomsRequested = 1, options = {}) => {
  const { available, totalUnits } = await getAvailableUnits(roomId, checkInAt, checkOutAt, options);
  if (available < roomsRequested) {
    throw new ApiError(
      409,
      totalUnits === 0
        ? "This room type has no units configured"
        : `Only ${available} unit(s) available for this slot`
    );
  }
};

export default { computeStayWindow, getAvailableUnits, assertAvailable };
