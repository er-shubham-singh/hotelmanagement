import { wrapEmail } from "../baseTemplate.js";

const row = (label, value, strong = false) => `
  <tr>
    <td style="padding:4px 0; color:#64748b; font-size:13px;">${label}</td>
    <td style="padding:4px 0; text-align:right; font-size:13px; ${strong ? "font-weight:700; color:#0f172a;" : "color:#334155;"}">${value}</td>
  </tr>
`;

export const paymentReceiptEmail = ({ name, bookingRef, priceBreakdown }) => {
  const { base, tax, discount = 0, walletUsed = 0, payable } = priceBreakdown;

  const html = wrapEmail({
    title: "Payment Receipt",
    preheader: `Payment received for booking ${bookingRef}`,
    bodyHtml: `
      <h1 style="margin:0 0 12px; font-size:20px; color:#0f172a;">Payment received, ${name}</h1>
      <p style="margin:0 0 16px; color:#334155; font-size:14px;">Here's the receipt for booking <strong>${bookingRef}</strong>.</p>
      <table role="presentation" width="100%">
        ${row("Room charges", `₹${base}`)}
        ${row("Taxes (GST)", `₹${tax}`)}
        ${discount ? row("Coupon discount", `-₹${discount}`) : ""}
        ${walletUsed ? row("Wallet used", `-₹${walletUsed}`) : ""}
        ${row("Total Paid", `₹${payable}`, true)}
      </table>
    `,
  });

  return { subject: `Payment receipt — ${bookingRef}`, html };
};

export default paymentReceiptEmail;
