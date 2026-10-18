import { Link } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  FileText,
  RotateCcw,
} from "lucide-react";
import { env } from "../config/env.js";

const CancellationPolicy = () => {
  return (
    <div className="container-app max-w-4xl py-8 sm:py-12">
      {/* Page Header */}
      <div className="mb-8 border-b border-border pb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <RotateCcw className="h-3.5 w-3.5" /> Razorpay Compliant Policy
        </div>
        <h1 className="mt-3 font-heading text-3xl font-bold text-text sm:text-4xl">
          Cancellation &amp; Refund Policy
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Last updated: October 2026 · Effective for all bookings on {env.appName}
        </p>
      </div>

      <div className="space-y-8 text-text-muted leading-relaxed">
        {/* Intro */}
        <section className="card p-6">
          <p className="text-text font-medium">
            At {env.appName}, we believe in transparency, flexibility, and convenience. We understand that travel
            plans can change unexpectedly. This Cancellation &amp; Refund Policy outlines the terms, timelines, and
            procedures for cancelling hotel room reservations, modifying bookings, and receiving refunds.
          </p>
          <p className="mt-3 text-sm">
            Please read this policy carefully before confirming your booking. By booking on {env.appName}, you agree
            to the terms outlined below.
          </p>
        </section>

        {/* Visual Cancellation Tiers */}
        <section>
          <h2 className="mb-4 font-heading text-xl font-bold text-text">
            1. Cancellation Windows &amp; Refund Slabs
          </h2>
          <p className="mb-4 text-sm">
            Refunds are calculated based on how far in advance of your scheduled check-in time you submit the
            cancellation request:
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* 100% Refund */}
            <div className="card relative flex flex-col justify-between border-primary/30 p-5 bg-primary/5">
              <div>
                <span className="inline-block rounded-md bg-success/20 px-2 py-1 text-xs font-semibold text-success">
                  Full Refund
                </span>
                <h3 className="mt-3 font-heading text-2xl font-bold text-text">100%</h3>
                <p className="mt-1 font-semibold text-sm text-text">6+ Hours Before Check-in</p>
                <p className="mt-2 text-xs text-text-muted">
                  Cancel 6 or more hours prior to your scheduled check-in time to receive a 100% full refund of the
                  amount paid.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-success font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> Zero cancellation fee
              </div>
            </div>

            {/* 50% Refund */}
            <div className="card relative flex flex-col justify-between border-warning/30 p-5 bg-warning/5">
              <div>
                <span className="inline-block rounded-md bg-warning/20 px-2 py-1 text-xs font-semibold text-warning">
                  Partial Refund
                </span>
                <h3 className="mt-3 font-heading text-2xl font-bold text-text">50%</h3>
                <p className="mt-1 font-semibold text-sm text-text">2 to 6 Hours Before Check-in</p>
                <p className="mt-2 text-xs text-text-muted">
                  Cancel between 2 and 6 hours before check-in time to receive a 50% refund of the paid booking amount.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-warning font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" /> 50% cancellation fee applies
              </div>
            </div>

            {/* 0% Refund */}
            <div className="card relative flex flex-col justify-between border-danger/30 p-5 bg-danger/5">
              <div>
                <span className="inline-block rounded-md bg-danger/20 px-2 py-1 text-xs font-semibold text-danger">
                  Non-Refundable
                </span>
                <h3 className="mt-3 font-heading text-2xl font-bold text-text">0%</h3>
                <p className="mt-1 font-semibold text-sm text-text">&lt; 2 Hours Before Check-in</p>
                <p className="mt-2 text-xs text-text-muted">
                  Cancellations made within 2 hours of check-in, or failure to check-in (No-Show), are non-refundable.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-danger font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" /> No refund applicable
              </div>
            </div>
          </div>
        </section>

        {/* Refund Processing Timelines & Modes */}
        <section className="card p-6 space-y-4">
          <h2 className="font-heading text-xl font-bold text-text flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" /> 2. Refund Processing &amp; Settlement Timelines
          </h2>
          <div className="rounded-lg bg-surface-muted p-4 text-sm text-text border border-border">
            <p className="font-semibold text-primary">Razorpay Mandatory Timeline Notice:</p>
            <p className="mt-1">
              Refunds are initiated immediately upon cancellation approval. The refund amount will be credited back to
              the original payment method (Credit Card, Debit Card, Net Banking, or UPI) within{" "}
              <strong className="text-text font-bold">5 to 7 business days</strong>, subject to your issuing bank's
              standard clearing process.
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="font-bold text-text shrink-0">•</span>
              <div>
                <strong className="text-text">Original Payment Source:</strong> Payments made via online methods
                (Cards, Net Banking, UPI) through our payment gateway (Razorpay) will be reversed directly to the
                originating bank account or card.
              </div>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-text shrink-0">•</span>
              <div>
                <strong className="text-text">Natasha Hotels Wallet:</strong> If you paid partially or fully using your
                Natasha Hotels wallet, the corresponding wallet balance will be re-credited to your wallet account
                instantly.
              </div>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-text shrink-0">•</span>
              <div>
                <strong className="text-text">Coupon &amp; Promotional Discounts:</strong> Discount coupons and
                promotional credits applied to a booking are single-use unless specified otherwise and will not be
                refunded in cash.
              </div>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-text shrink-0">•</span>
              <div>
                <strong className="text-text">Late or Missing Refunds:</strong> If you have not received your refund
                after 7 business days, please check your bank account statement or contact your card issuer. If the
                issue persists, contact our support team at{" "}
                <a href="mailto:support@staybyhour.com" className="text-primary hover:underline">
                  support@staybyhour.com
                </a>{" "}
                along with your Booking Reference ID and payment transaction ID.
              </div>
            </div>
          </div>
        </section>

        {/* How to Cancel */}
        <section className="card p-6 space-y-4">
          <h2 className="font-heading text-xl font-bold text-text flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> 3. How to Cancel Your Booking
          </h2>
          <p className="text-sm">You can cancel your booking conveniently using either of the following methods:</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-4 bg-surface-muted/50">
              <h4 className="font-heading font-semibold text-text text-sm">Method 1: Self-Service via Dashboard</h4>
              <ol className="mt-2 space-y-1.5 text-xs list-decimal list-inside text-text-muted">
                <li>Log in to your {env.appName} account.</li>
                <li>
                  Navigate to{" "}
                  <Link to="/dashboard/bookings" className="text-primary hover:underline">
                    Dashboard &gt; My Bookings
                  </Link>
                  .
                </li>
                <li>Select the relevant active booking.</li>
                <li>Click &quot;Cancel Booking&quot; and state your reason.</li>
                <li>Confirm cancellation — refund will be calculated automatically.</li>
              </ol>
            </div>

            <div className="rounded-xl border border-border p-4 bg-surface-muted/50">
              <h4 className="font-heading font-semibold text-text text-sm">Method 2: Contact Customer Support</h4>
              <p className="mt-2 text-xs">
                Reach out to our customer care team before the check-in cut-off with your Booking Reference number:
              </p>
              <div className="mt-3 space-y-1.5 text-xs text-text">
                <p>
                  📧 <strong>Email:</strong>{" "}
                  <a href="mailto:support@staybyhour.com" className="text-primary hover:underline">
                    support@staybyhour.com
                  </a>
                </p>
                <p>
                  📞 <strong>Helpline:</strong>{" "}
                  <a href="tel:+9118001234567" className="text-primary hover:underline">
                    +91 1800-123-4567
                  </a>
                </p>
                <p className="text-text-muted">Available 7 days a week, 9:00 AM – 9:00 PM IST.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Return & Service Delivery Policy */}
        <section className="card p-6 space-y-4">
          <h2 className="font-heading text-xl font-bold text-text flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> 4. Service Fulfillment &amp; Return / Replacement Policy
          </h2>
          <div className="space-y-3 text-sm">
            <p>
              <strong className="text-text">Electronic Service Delivery:</strong> {env.appName} provides digital
              hospitality booking services. Upon successful payment authorization, your booking confirmation, tax
              invoice, and digital room check-in access code are generated and delivered instantly via Email, SMS,
              and inside your user dashboard. No physical goods or courier delivery is involved.
            </p>
            <p>
              <strong className="text-text">Return / Exchange Applicability:</strong> Because hotel reservations are
              time-bound service bookings rather than physical tangible goods, physical &quot;returns&quot; or &quot;exchanges&quot; do
              not apply. If you wish to change your dates, check-in slot, or room type, please cancel the existing
              booking subject to the cancellation windows above and book a new reservation.
            </p>
          </div>
        </section>

        {/* Hotel-Initiated Cancellations & Force Majeure */}
        <section className="card p-6 space-y-3">
          <h2 className="font-heading text-xl font-bold text-text">
            5. Hotel-Initiated Cancellations &amp; Extraordinary Circumstances
          </h2>
          <div className="space-y-2 text-sm">
            <p>
              <strong className="text-text">Partner Hotel Unavailability:</strong> In the rare event that a hotel partner
              is unable to honour your confirmed reservation due to maintenance, unexpected overbooking, or property
              emergencies, {env.appName} will either arrange equivalent alternative accommodation at no extra charge or
              issue a <strong>100% full refund</strong> to your original payment source immediately.
            </p>
            <p>
              <strong className="text-text">Force Majeure:</strong> In cases of natural disasters, government lockdowns,
              acts of God, or severe travel restrictions beyond control, refund requests will be reviewed sympathetically
              on a case-by-case basis.
            </p>
          </div>
        </section>

        {/* Contact Us */}
        <section className="card p-6 space-y-4">
          <h2 className="font-heading text-xl font-bold text-text flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" /> 6. Questions &amp; Support Contact
          </h2>
          <p className="text-sm">
            If you have any questions regarding our Cancellation &amp; Refund Policy or require assistance with an existing
            booking, our grievance officer and customer care team are available to help:
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
                <p className="font-semibold text-text text-xs">Helpline</p>
                <a href="tel:+9118001234567" className="text-xs text-text hover:text-primary">
                  +91 1800-123-4567
                </a>
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-lg border border-border p-3">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-text text-xs">Registered Address</p>
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
};

export default CancellationPolicy;
