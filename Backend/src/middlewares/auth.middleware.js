import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;
  const token = bearer || req.cookies?.accessToken;

  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt.accessSecret);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new ApiError(401, "User no longer exists or is deactivated");
  }

  req.user = user;
  next();
});

// Attaches req.user when a valid token is present, but never rejects the request.
export const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;
  const token = bearer || req.cookies?.accessToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) req.user = user;
    } catch (error) {
      // ignore invalid token in optional mode
    }
  }

  next();
});

export default authenticate;
