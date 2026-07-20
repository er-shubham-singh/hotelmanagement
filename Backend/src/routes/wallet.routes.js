import { Router } from "express";
import { getWallet } from "../controllers/wallet.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getWallet);

export default router;
