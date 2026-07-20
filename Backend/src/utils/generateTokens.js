import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const generateAccessToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiry }
  );

export const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user._id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiry }
  );

export const verifyAccessToken = (token) => jwt.verify(token, config.jwt.accessSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, config.jwt.refreshSecret);

export const generateTokens = (user) => ({
  accessToken: generateAccessToken(user),
  refreshToken: generateRefreshToken(user),
});

export default generateTokens;
