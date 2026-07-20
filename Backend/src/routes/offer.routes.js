import { Router } from "express";
import { listOffers, validateOffer, createOffer, updateOffer, deleteOffer } from "../controllers/offer.controller.js";
import { authenticate, optionalAuthenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../config/constants.js";

const router = Router();

router.get("/", optionalAuthenticate, listOffers);
router.post("/validate", validateOffer);
router.post("/", authenticate, requireRole(ROLES.ADMIN), createOffer);
router.put("/:id", authenticate, requireRole(ROLES.ADMIN), updateOffer);
router.delete("/:id", authenticate, requireRole(ROLES.ADMIN), deleteOffer);

export default router;
