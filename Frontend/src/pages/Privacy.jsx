import { ShieldCheck, Lock, Eye, Mail, Phone, MapPin } from "lucide-react";
import { env } from "../config/env.js";

const Privacy = () => (
  <div className="container-app max-w-4xl py-8 sm:py-12">
    <div className="mb-8 border-b border-border pb-6">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
        <ShieldCheck className="h-3.5 w-3.5" /> Privacy &amp; Data Security
      </div>
      <h1 className="mt-3 font-heading text-3xl font-bold text-text sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-text-muted">
        Last updated: October 2026 · Committed to protecting your personal information at {env.appName}
      </p>
    </div>

    <div className="space-y-8 text-text-muted leading-relaxed">
      <section className="card p-6 space-y-3">
        <h2 className="font-heading text-xl font-bold text-text flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" /> 1. Information We Collect
        </h2>
        <p className="text-sm">
          To provide seamless booking services on {env.appName}, we collect the following categories of information:
        </p>
        <ul className="space-y-1.5 text-sm list-disc list-inside">
          <li>
            <strong className="text-text">Account Information:</strong> Name, verified mobile phone number (via OTP),
            and email address.
          </li>
          <li>
            <strong className="text-text">Reservation Details:</strong> Selected hotel, room type, check-in date/time,
            duration, guest count, and special booking requests.
          </li>
          <li>
            <strong className="text-text">Transaction Records:</strong> Razorpay order ID, payment status, amount paid,
            and invoice records.
          </li>
          <li>
            <strong className="text-text">Device &amp; Usage Data:</strong> IP address, browser type, and interaction
            logs used to prevent fraud and improve system performance.
          </li>
        </ul>
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="font-heading text-xl font-bold text-text flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" /> 2. Payment Security &amp; Razorpay Gateway
        </h2>
        <p className="text-sm">
          We take the security of your financial data very seriously. All payment transactions on {env.appName} are
          processed securely through <strong>Razorpay Software Private Limited</strong>, an RBI-authorized payment
          aggregator compliant with PCI-DSS (Payment Card Industry Data Security Standard) Level 1 certification.
        </p>
        <p className="text-sm">
          {env.appName} does <strong className="text-text">not</strong> collect, view, or store your sensitive card
          numbers, CVVs, or online banking passwords on our servers. All sensitive financial data is directly handled by
          Razorpay's encrypted infrastructure under 256-bit SSL encryption.
        </p>
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="font-heading text-xl font-bold text-text">3. How We Use &amp; Share Your Information</h2>
        <p className="text-sm">We strictly limit data usage and sharing to essential operational purposes:</p>
        <ul className="space-y-1.5 text-sm list-disc list-inside">
          <li>
            <strong className="text-text">Booking Fulfillment:</strong> Sharing guest name, contact number, and booking
            time-slot with the booked partner hotel so they can reserve your room and verify check-in.
          </li>
          <li>
            <strong className="text-text">Service Notifications:</strong> Sending booking confirmations, check-in PINs,
            cancellation updates, and tax invoices via SMS, WhatsApp, and email.
          </li>
          <li>
            <strong className="text-text">No Sale of Personal Data:</strong> We never sell, rent, or trade your personal
            identifiable information to third-party advertisers or data brokers.
          </li>
        </ul>
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="font-heading text-xl font-bold text-text">4. Your Rights &amp; Data Deletion</h2>
        <p className="text-sm">
          You have the right to access, review, correct, or request deletion of your account and personal data at any
          time. To initiate a data export or account closure, simply write to us at{" "}
          <a href="mailto:support@staybyhour.com" className="text-primary hover:underline font-medium">
            support@staybyhour.com
          </a>
          . We will process your request within 7 business days, subject to mandatory statutory tax and accounting
          retention requirements.
        </p>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="font-heading text-xl font-bold text-text">5. Grievance Officer &amp; Inquiries</h2>
        <p className="text-sm">
          In accordance with the Information Technology Act 2000 and rules made thereunder, any privacy queries or
          grievances may be directed to our Grievance Officer:
        </p>
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          <div className="flex items-start gap-2.5 rounded-lg border border-border p-3">
            <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text text-xs">Email</p>
              <a href="mailto:support@staybyhour.com" className="text-xs text-primary hover:underline">
                support@staybyhour.com
              </a>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border border-border p-3">
            <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text text-xs">Phone</p>
              <a href="tel:+9118001234567" className="text-xs text-text hover:text-primary">
                +91 1800-123-4567
              </a>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border border-border p-3">
            <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text text-xs">Address</p>
              <p className="text-xs text-text-muted">
                WeWork Galaxy, 43 Residency Road, Bangalore, KA - 560025, India
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
);

export default Privacy;
