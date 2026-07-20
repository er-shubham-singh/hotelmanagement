import { Router } from "express";
import {
  listNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  registerDeviceToken,
  removeDeviceToken,
} from "./notification.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", listNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markRead);
router.post("/token", registerDeviceToken);
router.delete("/token", removeDeviceToken);

export default router;
