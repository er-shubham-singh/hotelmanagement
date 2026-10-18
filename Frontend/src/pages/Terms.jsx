import { Link } from "react-router-dom";
import { ShieldCheck, FileText, CreditCard, RotateCcw, AlertTriangle, Scale, Mail, Phone, MapPin } from "lucide-react";
import { env } from "../config/env.js";

const Terms = () => (
  <div className="container-app max-w-4xl py-8 sm:py-12">
    {/* Page Header */}
    <div className="mb-8 border-b border-border pb-6">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
        <FileText className="h-3.5 w-3.5" /> Legal Agreement
      </div>
      <h1 className="mt-3 font-heading text-3xl font-bold text-text sm:text-4xl">Terms &amp; Conditions</h1>
      <p className="mt-2 text-sm text-text-muted">
        Last updated: October 2026 · Please read these terms carefully before using {env.appName}
      </p>
    </div>

    <div className="space-y-8 text-text-muted leading-relaxed">
      {/* 1. Introduction */}
      <section className="card p-6 space-y-3">
        <h2 className="font-heading text-xl font-bold text-text flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" /> 1. Introduction &amp; Acceptance of Terms
        </h2>
        <p className="text-sm">
          Welcome to <strong className="text-text">{env.appName}</strong> (&quot;Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). These Terms
          and Conditions (&quot;Terms&quot;) govern your access to and use of the {env.appName} website, mobile applications,
          and online booking services.
        </p>
        <p className="text-sm">
          By accessing, browsing, registering on, or using our Platform to make hotel reservations, you acknowledge that
          you have read, understood, and agree to be bound by these Terms, along with our{" "}
          <Link to="/privacy" className="text-primary hover:underline font-medium">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link to="/cancellation-policy" className="text-primary hover:underline font-medium">
            Cancellation &amp; Refund Policy
          </Link>
          . If you do not agree to these Terms, please refrain from using our services.
        </p>
      </section>

      {/* 2. Platform Overview & Intermediary Role */}
      <section className="card p-6 space-y-3">
        <h2 className="font-heading text-xl font-bold text-text">2. Platform Overview &amp; Role of Natasha Hotels</h2>
        <p className="text-sm">
          {env.appName} is an online hospitality marketplace that facilitates short-stay hourly (e.g., 3, 6, 12 hours)
          and full-day hotel room reservations between verified hotel partners (&quot;Hotel Partners&quot;) and guests
          (&quot;Guests&quot; or &quot;Users&quot;).
        </p>
        <p className="text-sm">
          {env.appName} operates as a technology intermediary under the Information Technology Act, 2000. While we
          thoroughly vet and partner with quality hospitality providers, the actual lodging contract and accommodation
          service is provided by the respective Hotel Partner. Check-in conduct, room amenities, and on-premises
          services remain the direct operational responsibility of the hotel.
        </p>
      </section>

      {/* 3. User Eligibility & Account Registration */}
      <section className="card p-6 space-y-3">
        <h2 className="font-heading text-xl font-bold text-text">3. User Eligibility &amp; Account Obligations</h2>
        <ul className="space-y-2 text-sm list-disc list-inside">
          <li>
            <strong className="text-text">Age Requirement:</strong> You must be at least 18 years of age and legally
            capable of entering into binding contracts under Indian law.
          </li>
          <li>
            <strong className="text-text">Account Accuracy:</strong> You agree to provide accurate, true, and complete
            information (including legal name, active mobile number, and email address) during registration and booking.
          </li>
          <li>
            <strong className="text-text">Account Security:</strong> You are responsible for safeguarding your login
            credentials and OTP verification codes. Any booking initiated through your authenticated account will be
            deemed authorized by you.
          </li>
        </ul>
      </section>

      {/* 4. Pricing, Taxes & Payment Gateway */}
      <section className="card p-6 space-y-4">
        <h2 className="font-heading text-xl font-bold text-text flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" /> 4. Pricing, Taxes &amp; Payment Gateway (Razorpay)
        </h2>
        <div className="space-y-3 text-sm">
          <p>
            <strong className="text-text">Currency &amp; Taxes:</strong> All prices listed on {env.appName} are
            displayed in Indian National Rupees (INR ₹). Room rates are clearly broken down into base tariff and
            applicable Goods and Services Tax (GST) prior to final payment confirmation.
          </p>
          <p>
            <strong className="text-text">Payment Gateway Partner:</strong> Online payments are processed securely
            through our authorized payment gateway partner, <strong>Razorpay Software Private Limited</strong>. We
            support major payment methods including Credit Cards (Visa, MasterCard, RuPay, Amex), Debit Cards, Unified
            Payments Interface (UPI / Google Pay, PhonePe, Paytm, BHIM), Net Banking across 50+ Indian banks, and
            approved digital wallets.
          </p>
          <p>
            <strong className="text-text">Security Standards:</strong> Payment processing complies with PCI-DSS Level 1
            and Reserve Bank of India (RBI) tokenization guidelines. {env.appName} does not store sensitive card CVVs or
            banking passwords on its internal servers.
          </p>
          <p>
            <strong className="text-text">Wallets &amp; Coupons:</strong> Promotional wallet credits, cashbacks, and
            coupon discounts are subject to individual campaign terms and cannot be exchanged for cash or transferred to
            third-party bank accounts outside permissible promotional rules.
          </p>
        </div>
      </section>

      {/* 5. Service Fulfillment & Booking Confirmation */}
      <section className="card p-6 space-y-3">
        <h2 className="font-heading text-xl font-bold text-text">5. Service Fulfillment &amp; Digital Voucher Delivery</h2>
        <p className="text-sm">
          Because {env.appName} provides digital reservation booking services, fulfillment is immediate and electronic.
          Upon successful payment authorization via Razorpay:
        </p>
        <ul className="space-y-1.5 text-sm list-disc list-inside">
          <li>Your unique Booking Reference (e.g., NBK-XXXXXX) is generated instantaneously.</li>
          <li>A digital booking confirmation voucher and tax invoice are sent to your registered email address and SMS.</li>
          <li>Your reservation and check-in access code are immediately accessible under your account dashboard.</li>
          <li>No physical shipping or postal delivery of documents is involved.</li>
        </ul>
      </section>

      {/* 6. Check-in, Identification & Property Rules */}
      <section className="card p-6 space-y-3">
        <h2 className="font-heading text-xl font-bold text-text">6. Check-in, Identification &amp; Hotel Policies</h2>
        <ul className="space-y-2 text-sm list-disc list-inside">
          <li>
            <strong className="text-text">Mandatory Identification:</strong> In accordance with local law and police
            regulations, every adult guest checking in must present an original, valid, government-issued photo ID
            (Aadhaar Card, Passport, Voter ID, or Driving License). PAN cards are not recognized as address proof by
            hotels.
          </li>
          <li>
            <strong className="text-text">Couple-Friendly &amp; Local IDs:</strong> Acceptance of local IDs and unmarried
            couples is explicitly indicated on each hotel's profile page. Please verify hotel badges before confirming.
          </li>
          <li>
            <strong className="text-text">Timings &amp; Overdue Stay:</strong> Guests must adhere to their booked
            time-slot. Stays extending beyond the scheduled checkout time will attract overdue penalty charges as
            stipulated at the time of booking.
          </li>
          <li>
            <strong className="text-text">Right of Admission:</strong> Hotel Partners reserve the right of admission.
            Guests exhibiting intoxication, abusive behavior, or failure to produce valid identification may be refused
            entry without refund.
          </li>
        </ul>
      </section>

      {/* 7. Cancellation & Refund Policy */}
      <section className="card p-6 space-y-4">
        <h2 className="font-heading text-xl font-bold text-text flex items-center gap-2">
          <RotateCcw className="h-5 w-5 text-primary" /> 7. Cancellation, Refund &amp; Return Policy
        </h2>
        <p className="text-sm">
          Cancellations and refunds are governed strictly by our transparent tiered policy:
        </p>
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          <div className="rounded-lg border border-border bg-surface-muted p-3 text-center">
            <span className="font-bold text-success">100% Refund</span>
            <p className="mt-1 text-xs text-text-muted">6+ hours before check-in time</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-muted p-3 text-center">
            <span className="font-bold text-warning">50% Refund</span>
            <p className="mt-1 text-xs text-text-muted">2 to 6 hours before check-in time</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-muted p-3 text-center">
            <span className="font-bold text-danger">0% (Non-refundable)</span>
            <p className="mt-1 text-xs text-text-muted">Less than 2 hours before check-in / No-show</p>
          </div>
        </div>
        <p className="text-sm">
          <strong className="text-text">Refund Settlement Period:</strong> Approved refunds are initiated immediately
          and credited back to the original source of payment within{" "}
          <strong className="text-text font-bold">5 to 7 business days</strong> as per standard banking and Razorpay
          settlement timelines.
        </p>
        <p className="text-sm">
          For full details, please review our comprehensive{" "}
          <Link to="/cancellation-policy" className="text-primary hover:underline font-semibold">
            Cancellation &amp; Refund Policy
          </Link>
          .
        </p>
      </section>

      {/* 8. Prohibited Activities */}
      <section className="card p-6 space-y-3">
        <h2 className="font-heading text-xl font-bold text-text flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" /> 8. Prohibited Uses &amp; Guest Conduct
        </h2>
        <p className="text-sm">Users of the Platform agree NOT to:</p>
        <ul className="space-y-1.5 text-sm list-disc list-inside">
          <li>Use the Platform or partner hotel premises for unlawful, immoral, commercial, or illegal activities.</li>
          <li>Provide fraudulent payment credentials or fake identity documents.</li>
          <li>Damage hotel property, disturb fellow guests, or engage in violent, harassing, or threatening behavior.</li>
          <li>Resell, sublicense, or commercially exploit reservations booked through {env.appName}.</li>
        </ul>
      </section>

      {/* 9. Limitation of Liability */}
      <section className="card p-6 space-y-3">
        <h2 className="font-heading text-xl font-bold text-text">9. Disclaimers &amp; Limitation of Liability</h2>
        <p className="text-sm">
          To the maximum extent permitted by applicable Indian law, {env.appName} provides the Platform on an &quot;as is&quot;
          and &quot;as available&quot; basis without warranties of any kind. {env.appName} shall not be liable for any indirect,
          incidental, special, punitive, or consequential damages resulting from hotel partner service deficiencies,
          personal injury, lost property, or service interruptions.
        </p>
        <p className="text-sm">
          In any event, our total cumulative liability to you for any claim arising out of a booking shall not exceed the
          total amount actually paid by you for that specific reservation.
        </p>
      </section>

      {/* 10. Governing Law & Dispute Resolution */}
      <section className="card p-6 space-y-3">
        <h2 className="font-heading text-xl font-bold text-text flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" /> 10. Governing Law &amp; Jurisdiction
        </h2>
        <p className="text-sm">
          These Terms and any dispute or claim arising out of or in connection with them shall be governed by and
          construed in accordance with the laws of <strong>India</strong>. Any legal suit, action, or proceeding
          arising out of these Terms shall be instituted exclusively in the competent courts situated in{" "}
          <strong>Bengaluru, Karnataka, India</strong>.
        </p>
      </section>

      {/* 11. Contact & Grievance Redressal */}
      <section className="card p-6 space-y-4">
        <h2 className="font-heading text-xl font-bold text-text">11. Grievance Redressal &amp; Contact Details</h2>
        <p className="text-sm">
          In accordance with the Information Technology Act 2000 and the Consumer Protection (E-Commerce) Rules, 2020,
          if you have any queries, concerns, or grievances regarding these Terms or our services, please reach out to us:
        </p>
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          <div className="flex items-start gap-2.5 rounded-lg border border-border p-3">
            <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text text-xs">Grievance Email</p>
              <a href="mailto:support@staybyhour.com" className="text-xs text-primary hover:underline">
                support@staybyhour.com
              </a>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border border-border p-3">
            <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text text-xs">Customer Support</p>
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
                WeWork Galaxy, 43 Residency Road, Bengaluru, Karnataka - 560025, India
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
);

export default Terms;
