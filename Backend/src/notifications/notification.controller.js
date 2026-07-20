import { Notification } from "./notification.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// GET /notifications?page=&limit=
export const listNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Number(limit));

  const [notifications, total] = await Promise.all([
    Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Notification.countDocuments({ user: req.user._id }),
  ]);

  res.status(200).json(
    new ApiResponse(200, { notifications, total, page: pageNum, pages: Math.ceil(total / limitNum) }, "Notifications fetched")
  );
});

// GET /notifications/unread-count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.status(200).json(new ApiResponse(200, { count }, "Unread count fetched"));
});

// PATCH /notifications/:id/read
export const markRead = asyncHandler(async (req, res) => {
  await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { isRead: true });
  res.status(200).json(new ApiResponse(200, null, "Marked as read"));
});

// PATCH /notifications/read-all
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.status(200).json(new ApiResponse(200, null, "All marked as read"));
});

// POST /notifications/token { token }
export const registerDeviceToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (token) {
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { deviceTokens: token } });
  }
  res.status(200).json(new ApiResponse(200, null, "Device token registered"));
});

// DELETE /notifications/token { token }
export const removeDeviceToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (token) {
    await User.findByIdAndUpdate(req.user._id, { $pull: { deviceTokens: token } });
  }
  res.status(200).json(new ApiResponse(200, null, "Device token removed"));
});

export default { listNotifications, getUnreadCount, markRead, markAllRead, registerDeviceToken, removeDeviceToken };
