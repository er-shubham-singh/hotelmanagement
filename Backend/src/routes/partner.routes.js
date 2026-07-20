import { Router } from "express";
import {
  createPartnerLead,
  listPartnerLeads,
  updatePartnerLeadStatus,
  submitContact,
} from "../controllers/partner.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../config/constants.js";

const router = Router();

router.post("/partner/leads", createPartnerLead);
router.get("/partner/leads", authenticate, requireRole(ROLES.ADMIN), listPartnerLeads);
router.patch("/partner/leads/:id", authenticate, requireRole(ROLES.ADMIN), updatePartnerLeadStatus);
router.post("/contact", submitContact);

export default router;
