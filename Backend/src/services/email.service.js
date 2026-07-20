import { getTransporter } from "../config/mailer.js";
import { config } from "../config/env.js";
import { bookingConfirmedEmail } from "../emails/templates/bookingConfirmed.js";
import { paymentReceiptEmail } from "../emails/templates/paymentReceipt.js";
import { checkInCodeEmail } from "../emails/templates/checkInCode.js";
import { checkOutCodeEmail } from "../emails/templates/checkOutCode.js";
import { thankYouEmail } from "../emails/templates/thankYou.js";

export const sendEmail = async ({ to, subject, html, text, attachments }) => {
  if (!to) return null; // e.g. a guest who signed up via phone with no email on file

  const transporter = getTransporter();

  const info = await transporter.sendMail({
    from: config.mailFrom,
    to,
    subject,
    text,
    html,
    attachments,
  });

  if (config.nodeEnv === "development") {
    // eslint-disable-next-line no-console
    console.log(`[mailer] Sent "${subject}" to ${to}`, info.message ? "" : info.messageId || "");
  }

  return info;
};

// Named template senders — every templated email in the app goes through one
// of these, which all funnel into sendEmail() above.
export const sendBookingConfirmedEmail = (to, data) => sendEmail({ to, ...bookingConfirmedEmail(data) });

export const sendPaymentReceiptEmail = (to, data) => sendEmail({ to, ...paymentReceiptEmail(data) });

export const sendCheckInCodeEmail = (to, data) => sendEmail({ to, ...checkInCodeEmail(data) });

export const sendCheckOutCodeEmail = (to, data) => sendEmail({ to, ...checkOutCodeEmail(data) });

export const sendThankYouEmail = (to, data) => sendEmail({ to, ...thankYouEmail(data) });

export default {
  sendEmail,
  sendBookingConfirmedEmail,
  sendPaymentReceiptEmail,
  sendCheckInCodeEmail,
  sendCheckOutCodeEmail,
  sendThankYouEmail,
};
