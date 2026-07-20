import { wrapEmail, codeBlock } from "../baseTemplate.js";

export const checkOutCodeEmail = ({ name, bookingRef, hotelName, code, expiresAt }) => {
  const html = wrapEmail({
    title: "Your Check-out Code",
    preheader: `Your check-out code for booking ${bookingRef}`,
    bodyHtml: `
      <h1 style="margin:0 0 12px; font-size:20px; color:#0f172a;">Enjoy your stay, ${name}!</h1>
      <p style="margin:0 0 4px; color:#334155; font-size:14px; line-height:1.6;">
        When you're ready to leave <strong>${hotelName}</strong>, give this code to the front desk to check out of booking <strong>${bookingRef}</strong>.
      </p>
      ${codeBlock(code)}
      <p style="margin:0; color:#94a3b8; font-size:12px;">
        Valid until ${new Date(expiresAt).toLocaleString("en-IN")}. Checking out after your slot ends may incur an overdue penalty.
      </p>
    `,
  });

  return { subject: `Your check-out code — ${bookingRef}`, html };
};

export default checkOutCodeEmail;
