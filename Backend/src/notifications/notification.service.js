import { Notification } from "./notification.model.js";
import { User } from "../models/user.model.js";
import { sendPush } from "./firebase.js";
import { emitToUser } from "../services/realtime.service.js";

// Single reusable entry point: persists an in-app record, pushes via FCM to
// the user's registered device tokens, and emits a realtime socket event.
// Call this from booking transitions, cron jobs, payment webhooks, admin
// actions — anywhere a user needs to be told something.
export const sendNotification = async (userId, { title, body, type, data = {} }) => {
  if (!userId) return null;

  const notification = await Notification.create({ user: userId, title, body, type, data });

  // Fire-and-forget push + realtime — a failure here must never break the
  // caller's primary flow (e.g. a booking transition).
  User.findById(userId)
    .select("deviceTokens")
    .then((user) => {
      if (user?.deviceTokens?.length) {
        sendPush(user.deviceTokens, { title, body, data: { type, ...data } }).catch(() => null);
      }
    })
    .catch(() => null);

  emitToUser(userId, "notification:new", { notification });

  return notification;
};

export default { sendNotification };
