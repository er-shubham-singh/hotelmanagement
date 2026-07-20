import { wrapEmail } from "../baseTemplate.js";

export const bookingConfirmedEmail = ({ name, bookingRef, hotelName, checkInAt, durationHrs }) => {
  const html = wrapEmail({
    title: "Booking Confirmed",
    preheader: `Your booking ${bookingRef} is confirmed`,
    bodyHtml: `
      <h1 style="margin:0 0 12px; font-size:20px; color:#0f172a;">Booking confirmed, ${name}!</h1>
      <p style="margin:0 0 8px; color:#334155; font-size:14px; line-height:1.6;">
        Your stay at <strong>${hotelName}</strong> is confirmed.
      </p>
      <p style="margin:0; color:#334155; font-size:14px; line-height:1.6;">
        Reference: <strong>${bookingRef}</strong><br/>
        Check-in: <strong>${new Date(checkInAt).toLocaleString("en-IN")}</strong><br/>
        Duration: <strong>${durationHrs === 24 ? "Full Day" : `${durationHrs} Hours`}</strong>
      </p>
    `,
  });

  return { subject: `Booking confirmed — ${bookingRef}`, html };
};

export default bookingConfirmedEmail;
