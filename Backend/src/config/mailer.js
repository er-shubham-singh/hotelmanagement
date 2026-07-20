import nodemailer from "nodemailer";
import { config } from "./env.js";

let transporter;

export const getTransporter = () => {
  if (transporter) return transporter;

  if (!config.smtp.host || !config.smtp.user) {
    // No SMTP configured — fall back to a JSON transport that just logs the email.
    transporter = nodemailer.createTransport({ jsonTransport: true });
    // eslint-disable-next-line no-console
    console.warn("[mailer] SMTP not configured — emails will be logged to the console instead of sent.");
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  return transporter;
};

export default getTransporter;
