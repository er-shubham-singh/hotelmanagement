import { Router } from "express";
import {
  getProfile,
  updateProfile,
  getFavourites,
  addFavourite,
  removeFavourite,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/me", getProfile);
router.put("/me", updateProfile);
router.get("/me/favourites", getFavourites);
router.post("/me/favourites/:hotelId", addFavourite);
router.delete("/me/favourites/:hotelId", removeFavourite);

export default router;
