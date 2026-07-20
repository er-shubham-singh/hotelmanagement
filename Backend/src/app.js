import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { config } from "./config/env.js";
import routes from "./routes/index.js";
import { notFound } from "./middlewares/notFound.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { handleWebhook } from "./controllers/payment.controller.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [config.clientUrl, config.adminPanelUrl],
    credentials: true,
  })
);

// Razorpay webhook needs the raw request body for HMAC signature verification —
// it MUST be registered before express.json() or the body will already be parsed.
app.post("/api/v1/payments/webhook", express.raw({ type: "application/json" }), handleWebhook);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(config.nodeEnv === "development" ? "dev" : "combined"));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", globalLimiter);

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/v1", routes);

app.use(notFound);
app.use(errorMiddleware);

export default app;
