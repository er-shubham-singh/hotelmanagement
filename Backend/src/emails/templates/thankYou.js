import { wrapEmail } from "../baseTemplate.js";
import { config } from "../../config/env.js";

export const thankYouEmail = ({ name, bookingRef, hotelName, hotelSlug }) => {
  const html = wrapEmail({
    title: "Thank You for Staying with Us",
    preheader: `Thanks for staying at ${hotelName}!`,
    bodyHtml: `
      <h1 style="margin:0 0 12px; font-size:20px; color:#0f172a;">Thanks for staying with us, ${name}!</h1>
      <p style="margin:0 0 12px; color:#334155; font-size:14px; line-height:1.6;">
        We hope you had a comfortable stay at <strong>${hotelName}</strong> (booking <strong>${bookingRef}</strong>).
        Your feedback helps other travelers — got two minutes to share how it went?
      </p>
      <p style="margin:0 0 12px; color:#334155; font-size:14px; line-height:1.6;">
        As a thank-you, here's <strong>10% off (code <span style="color:#0f766e; font-weight:700;">WELCOME10</span>)</strong> your next hourly stay.
      </p>
      <p style="margin:0; color:#94a3b8; font-size:12px;">
        Questions about this stay? Just reply to this email — we're happy to help.
      </p>
    `,
    ctaLabel: "Leave a Review",
    ctaUrl: `${config.clientUrl}/hotels/${hotelSlug}`,
  });

  return { subject: `Thanks for staying with StayByHour!`, html };
};

export default thankYouEmail;
