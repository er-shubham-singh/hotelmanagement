import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";
import { Booking } from "../models/booking.model.js";
import { sendEmail } from "./email.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const invoicesDir = path.join(__dirname, "..", "..", "uploads", "invoices");

const ensureDir = () => {
  if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });
};

// Generates a GST-broken-down invoice PDF for a completed booking, saves it
// under uploads/invoices, stores the URL on the booking, and emails it.
export const generateInvoice = async (booking) => {
  ensureDir();

  const populated = await Booking.findById(booking._id).populate("hotel", "name address").populate("room", "type").populate("user", "name email");

  const filename = `${populated.bookingRef}.pdf`;
  const filepath = path.join(invoicesDir, filename);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    doc.fontSize(20).text("StayByHour", { continued: false });
    doc.fontSize(10).fillColor("#64748b").text("Tax Invoice / Receipt").moveDown(1.5);

    doc.fillColor("#0f172a").fontSize(12).text(`Invoice for booking: ${populated.bookingRef}`);
    doc.text(`Guest: ${populated.guest.name} (${populated.guest.phone})`);
    doc.text(`Hotel: ${populated.hotel?.name || "-"}`);
    doc.text(`Room: ${populated.room?.type || "-"}`);
    doc.text(`Check-in: ${new Date(populated.checkInAt).toLocaleString("en-IN")}`);
    doc.text(`Check-out: ${new Date(populated.checkOutAt).toLocaleString("en-IN")}`);
    doc.moveDown();

    const { base, tax, discount, walletUsed, payable } = populated.priceBreakdown;
    doc.fontSize(13).text("Price Breakdown", { underline: true }).moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Room charges: ₹${base}`);
    doc.text(`GST (12%): ₹${tax}`);
    if (discount) doc.text(`Coupon discount: -₹${discount}`);
    if (walletUsed) doc.text(`Wallet used: -₹${walletUsed}`);
    if (populated.penaltyAmount) doc.text(`Overdue penalty: ₹${populated.penaltyAmount}`);
    doc.moveDown(0.5).fontSize(13).text(`Total Paid: ₹${payable + (populated.penaltyAmount || 0)}`, { underline: true });

    doc.moveDown(2).fontSize(9).fillColor("#64748b").text("This is a system-generated invoice and does not require a signature.");

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  const invoiceUrl = `/uploads/invoices/${filename}`;
  await Booking.findByIdAndUpdate(booking._id, { invoiceUrl });

  if (populated.user?.email) {
    await sendEmail({
      to: populated.user.email,
      subject: `Your StayByHour invoice — ${populated.bookingRef}`,
      text: `Thanks for staying with StayByHour. Your invoice is attached.`,
      attachments: [{ filename, path: filepath }],
    }).catch(() => null);
  }

  return invoiceUrl;
};

export default { generateInvoice };
