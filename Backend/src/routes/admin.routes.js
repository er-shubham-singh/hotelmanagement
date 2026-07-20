import { Router } from "express";
import {
  getDashboardStats,
  listUsers,
  updateUserRole,
  issueManualRefund,
  verifyCheckIn,
  verifyCheckOut,
  resendAccessCode,
  listAuditLogs,
} from "../controllers/admin.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../config/constants.js";

const router = Router();

router.use(authenticate);

const staffRoles = [ROLES.ADMIN, ROLES.HOTEL_OWNER];

// Stats are scoped inside the controller (admin sees all, hotelOwner sees only their own hotels).
router.get("/stats", requireRole(...staffRoles), getDashboardStats);
router.get("/users", requireRole(ROLES.ADMIN), listUsers);
router.patch("/users/:id/role", requireRole(ROLES.ADMIN), updateUserRole);
router.post("/bookings/:id/refund", requireRole(...staffRoles), issueManualRefund);
router.post("/bookings/:id/verify-checkin", requireRole(...staffRoles), verifyCheckIn);
router.post("/bookings/:id/verify-checkout", requireRole(...staffRoles), verifyCheckOut);
router.post("/bookings/:id/resend-code", requireRole(...staffRoles), resendAccessCode);
router.get("/audit-logs", requireRole(ROLES.ADMIN), listAuditLogs);

export default router;
