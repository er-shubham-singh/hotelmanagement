import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { QrCode, CreditCard, Copy, MessageCircle } from "lucide-react";
import Button from "../common/Button.jsx";
import AnimatedCheck from "./AnimatedCheck.jsx";
import { useBookingRoom, useSocketEvent } from "../hooks/useSocket.js";
import { useAuth } from "../hooks/useAuth.js";
import {
  createPaymentOrder,
  verifyPayment,
  createPaymentQr,
  mockCompletePayment,
  createFineOrder,
  verifyFinePayment,
} from "../api/payment.api.js";
import { formatCurrency } from "../utils/formatters.js";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// Handles both the normal booking-payment flow and the overdue-fine flow —
// same UI, different API calls underneath (selected via `mode`).
const PaymentPanel = ({ bookingId, bookingRef, amount, guest, mode = "booking", onPaid }) => {
  const { user } = useAuth();
  const [isPaying, setIsPaying] = useState(false);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [qr, setQr] = useState(null);
  const [isPaid, setIsPaid] = useState(false);

  useBookingRoom(bookingId);
  useSocketEvent(
    "payment:success",
    (payload) => {
      if (payload.bookingId === bookingId) {
        setIsPaid(true);
        toast.success("Payment received!");
        onPaid?.();
      }
    },
    [bookingId, onPaid]
  );

  const orderFns = mode === "fine" ? { create: () => createFineOrder(bookingId), verify: (body) => verifyFinePayment(bookingId, body) } : { create: () => createPaymentOrder(bookingId), verify: verifyPayment };

  const handlePayNow = async () => {
    setIsPaying(true);
    try {
      const { data } = await orderFns.create();
      const order = data.data;

      if (order.mock) {
        await mockCompletePayment(bookingId);
        setIsPaid(true);
        toast.success("Payment successful (mock mode)");
        onPaid?.();
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Could not load payment gateway — please try again");
        return;
      }

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        order_id: order.orderId,
        name: "StayByHour",
        description: mode === "fine" ? `Overdue fine — ${bookingRef}` : `Booking ${bookingRef}`,
        prefill: { name: guest?.name || user?.name, contact: guest?.phone || user?.phone, email: user?.email },
        theme: { color: "#0f766e" },
        handler: async (response) => {
          try {
            await orderFns.verify({
              bookingId: mode === "fine" ? undefined : bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setIsPaid(true);
            toast.success("Payment successful!");
            onPaid?.();
          } catch (error) {
            // handled by interceptor
          }
        },
        modal: {
          ondismiss: () => setIsPaying(false),
        },
      });

      razorpay.on("payment.failed", () => {
        toast.error("Payment failed — please try again");
        setIsPaying(false);
      });

      razorpay.open();
    } catch (error) {
      // handled by interceptor
    } finally {
      setIsPaying(false);
    }
  };

  const handleGenerateQr = async () => {
    setIsGeneratingQr(true);
    try {
      const { data } = await createPaymentQr(bookingId);
      setQr(data.data);
    } catch (error) {
      // handled by interceptor
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(qr.url);
    toast.success("Link copied");
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Pay for StayByHour booking ${bookingRef}: ${qr.url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (isPaid) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <AnimatedCheck />
        <p className="font-heading text-lg font-semibold text-text">Payment Successful</p>
        <p className="text-sm text-text-muted">Booking {bookingRef} is confirmed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3">
        <span className="text-sm text-text-muted">{mode === "fine" ? "Penalty due" : "Amount payable"}</span>
        <span className="font-heading text-lg font-semibold text-text">{formatCurrency(amount)}</span>
      </div>

      <Button className="w-full" variant="accent" isLoading={isPaying} onClick={handlePayNow}>
        <CreditCard className="h-4 w-4" /> Pay Now
      </Button>

      {mode !== "fine" && (
        <>
          {!qr ? (
            <Button className="w-full" variant="outline" isLoading={isGeneratingQr} onClick={handleGenerateQr}>
              <QrCode className="h-4 w-4" /> Generate &amp; Share QR
            </Button>
          ) : (
            <div className="rounded-xl border border-border p-4 text-center">
              <p className="mb-3 text-sm text-text-muted">Scan to pay, or share the link with someone else</p>
              <img src={qr.qrDataUrl} alt="Payment QR code" className="mx-auto h-40 w-40" />
              <div className="mt-3 flex gap-2">
                <Button variant="outline" className="flex-1 text-sm" onClick={copyLink}>
                  <Copy className="h-3.5 w-3.5" /> Copy Link
                </Button>
                <Button variant="outline" className="flex-1 text-sm" onClick={shareOnWhatsApp}>
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </Button>
              </div>
              {qr.mock && (
                <Button className="mt-3 w-full text-sm" onClick={() => mockCompletePayment(bookingId).then(() => { setIsPaid(true); onPaid?.(); })}>
                  Simulate scan &amp; pay (mock mode)
                </Button>
              )}
              <p className="mt-3 text-xs text-text-muted">This page updates automatically the instant payment is received.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentPanel;
