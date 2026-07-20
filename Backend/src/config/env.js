import dotenv from "dotenv";

dotenv.config();

const required = ["MONGO_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.warn(`[env] Missing environment variable: ${key} — using an insecure fallback for local dev only.`);
  }
}

export const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/staybyhour",
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "dev_access_secret_change_me",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me",
    accessExpiry: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  },
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  adminPanelUrl: process.env.ADMIN_PANEL_URL || "http://localhost:5175",
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  mailFrom: process.env.MAIL_FROM || "StayByHour <no-reply@staybyhour.com>",
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  },
  firebase: {
    serviceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "",
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "",
  },
  jobsEnabled: process.env.JOBS_ENABLED !== "false",
  cron: {
    holdExpiry: process.env.CRON_HOLD_EXPIRY || "*/1 * * * *",
    activateBookings: process.env.CRON_ACTIVATE_BOOKINGS || "*/1 * * * *",
    checkoutReminder: process.env.CRON_CHECKOUT_REMINDER || "*/1 * * * *",
    overduePenalty: process.env.CRON_OVERDUE_PENALTY || "*/5 * * * *",
    noShow: process.env.CRON_NO_SHOW || "*/5 * * * *",
    slotCleanup: process.env.CRON_SLOT_CLEANUP || "*/10 * * * *",
  },
};

export default config;
