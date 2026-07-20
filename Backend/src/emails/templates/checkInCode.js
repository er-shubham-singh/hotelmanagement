import { wrapEmail, codeBlock } from "../baseTemplate.js";

export const checkInCodeEmail = ({ name, bookingRef, hotelName, code, expiresAt }) => {
  const html = wrapEmail({
    title: "Your Check-in Code",
    preheader: `Your check-in code for booking ${bookingRef}`,
    bodyHtml: `
      <h1 style="margin:0 0 12px; font-size:20px; color:#0f172a;">You're all set, ${name}!</h1>
      <p style="margin:0 0 4px; color:#334155; font-size:14px; line-height:1.6;">
        Show this code to the front desk at <strong>${hotelName}</strong> to check in for booking <strong>${bookingRef}</strong>.
      </p>
      ${codeBlock(code)}
      <p style="margin:0; color:#94a3b8; font-size:12px;">
        Valid until ${new Date(expiresAt).toLocaleString("en-IN")}. Keep it private — anyone with this code can check you in.
      </p>
    `,
  });

  return { subject: `Your check-in code — ${bookingRef}`, html };
};

export default checkInCodeEmail;
