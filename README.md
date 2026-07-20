# StayByHour — Hourly & Full-Day Hotel Booking Platform

A full-stack hourly/day-use hotel booking platform (functionally inspired by
Brevistay, with an original teal/amber brand identity). The monorepo has
three independent apps:

```
hotelManagement/
├── Backend/      # Node + Express + MongoDB + Socket.IO API (port 5000)
├── Frontend/     # Guest-facing React app — search, booking, dashboard (port 5173)
└── AdminPanel/   # Standalone React app for admins / hotel owners (port 5175)
```

Frontend and AdminPanel are two separate deployable apps that both talk to
the same Backend API — they share no code and can be hosted independently.

---

## Prerequisites

- Node.js 18+ (tested on Node 24)
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or an Atlas connection string
- npm

---

## 1. Backend setup

```bash
cd Backend
cp .env.example .env      # edit MONGO_URI / JWT secrets / SMTP / Razorpay / Firebase if needed
npm install
npm run seed               # creates admin user, 8 cities, 12 hotels, offers, reviews
npm run dev                 # http://localhost:5000
```

Seeded accounts (also printed by the seed script):

| Role         | Identifier              | Password  |
|--------------|--------------------------|-----------|
| Admin        | admin@staybyhour.com / 9999900000 | Admin@123 |
| Demo guest   | 9000000001 (or ...02/...03)       | User@123  |

Guest phone-OTP login also works — in development, the OTP is returned in
the API response and logged to the server console (no real SMS is sent).

Health check: `GET http://localhost:5000/api/v1/health`

## 2. Frontend setup (guest site)

```bash
cd Frontend
cp .env.example .env       # VITE_API_BASE_URL / VITE_SOCKET_URL should point at the Backend
npm install
npm run dev                 # http://localhost:5173
```

## 3. AdminPanel setup (admin / hotel-owner console)

```bash
cd AdminPanel
cp .env.example .env
npm install
npm run dev                 # http://localhost:5175
```

Sign in with the seeded admin account above. Users with role `hotelOwner`
see the Dashboard and Bookings/Hotels scoped to only their own hotels;
`admin` sees everything (Dashboard, Cities, Offers, Bookings, Partner Leads,
Users, Audit Log).

## Running all three together

Open three terminals:

```bash
cd Backend && npm run dev
cd Frontend && npm run dev
cd AdminPanel && npm run dev
```

Backend's `.env` has `CLIENT_URL` and `ADMIN_PANEL_URL` — keep these in sync
with whatever ports Frontend/AdminPanel actually run on, since they're used
for both the CORS allow-list and Socket.IO's allowed origins.

---

## Booking lifecycle (status state machine)

Every booking moves through a single, centrally-enforced state machine
(`Backend/src/services/bookingStatus.service.js`) — no code ever sets
`booking.status` directly outside of it, and every transition is recorded in
`booking.statusHistory[]`.

```
ACCEPTED   → CONFIRMED | EXPIRED | CANCELLED
CONFIRMED  → ACTIVE | CANCELLED | NO_SHOW
ACTIVE     → CHECKED_IN | NO_SHOW | CANCELLED
CHECKED_IN → COMPLETED | OVERDUE
OVERDUE    → COMPLETED   (only after the penalty is paid)
```

- **ACCEPTED**: booking created, slot soft-held for `HOLD_EXPIRY_MINUTES`
  (default 10) while payment is pending.
- **CONFIRMED**: payment succeeded (or wallet/coupon covered the full amount).
- **ACTIVE**: the check-in window has opened.
- **CHECKED_IN → COMPLETED**: checked out on time.
- **CHECKED_IN → OVERDUE**: checked out (or swept by cron) past
  `CHECKOUT_GRACE_MINUTES` (default 30) without checking out — a penalty
  starts accruing (`OVERDUE_PENALTY_PER_HOUR`) and checkout is blocked until
  the fine is paid.
- **EXPIRED / NO_SHOW / CANCELLED**: terminal, slot released.

**Real availability**: `Backend/src/services/availability.service.js`
computes "X of Y available" live by counting overlapping bookings in
holding states for a room — nothing is double-booked, and capacity is
released automatically the instant a booking reaches a terminal status.

**Cron jobs** (`Backend/src/jobs/`, node-cron, schedules configurable via
`CRON_*` env vars, disable all with `JOBS_ENABLED=false`):
`holdExpiry` · `activateBookings` · `checkoutReminder` · `overduePenalty` ·
`noShow` · `slotCleanup` (a broad reconciliation safety net).

## Payments (Razorpay)

`Backend/src/services/payment.service.js` runs in **mock mode** automatically
whenever `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` are blank — bookings and
fines "pay" instantly without a real gateway, so the whole app works out of
the box with zero external accounts. Add real (test-mode is fine) Razorpay
keys to go live with the actual Checkout widget and Payment Links/QR codes.

- `POST /payments/order` + `POST /payments/verify` — standard pay-now flow
  (Frontend opens the real Razorpay Checkout modal when keys are configured).
- `POST /payments/qr` — generates a shareable payment link + QR code so
  **anyone** (not just the logged-in guest) can pay for a booking; the
  booking page updates to "Paid" in realtime via Socket.IO the instant
  payment lands, wherever it's being viewed.
- `POST /payments/webhook` — signature-verified webhook (raw body, mounted
  before the JSON parser in `app.js`), the source of truth for payment state.
- `POST /payments/fine/:bookingId` (+ `/verify`) — same flow for paying off
  an overdue penalty to unlock checkout.

## Realtime & notifications

- **Socket.IO** (`Backend/src/config/socket.js`): JWT-authenticated on
  connect, each user joins a private room; booking pages also join a
  `booking:{id}` room so an anonymous QR-code payer's tab updates live too.
- **Notifications** (`Backend/src/notifications/`): every meaningful event
  (booking confirmed, check-in window open, checkout reminder, overdue
  penalty, payment success/failure, refund, cancellation, no-show, referral
  reward…) is persisted, pushed via Firebase Cloud Messaging, and emitted
  over the socket — all from one `sendNotification()` call. The navbar bell
  in Frontend/AdminPanel shows a live unread badge.
- **Firebase push** is optional — leave `FIREBASE_SERVICE_ACCOUNT_JSON`
  (backend) and `VITE_FIREBASE_*` (frontend) blank to disable browser push;
  in-app + realtime notifications work regardless.

## Other Part 2 features

- **Refunds**: tiered cancellation policy (full refund 6+ hrs before
  check-in, 50% between 2–6 hrs, none inside 2 hrs) credited to the guest's
  wallet; admins can also issue an arbitrary manual refund.
- **Invoices**: a GST-broken-down PDF is generated and emailed automatically
  when a stay completes (`Backend/src/services/invoice.service.js`),
  downloadable from *My Bookings*.
- **Referrals**: every user gets a referral code (`Profile` page); a new
  signup can enter one, and both sides get ₹150 wallet credit the moment the
  referee completes their first stay.
- **Reviews** are gated — only guests with a `COMPLETED` booking at a hotel
  can review it.
- **Reschedule**: guests can move an unpaid/paid-but-not-checked-in booking
  to a new slot (re-checks availability; blocks the move if the new slot
  costs more than what's already been paid).
- **Audit log**: every admin mutation (hotel/room/offer CRUD, role changes,
  manual refunds) is recorded and viewable at AdminPanel → Audit Log.
- **Idempotency**: `POST /bookings` accepts an `idempotencyKey` so a client
  retry never double-books.

## Google sign-in

`POST /auth/google` accepts a Firebase ID token (obtained on the frontend via
`signInWithPopup` + `GoogleAuthProvider`, in `Frontend/src/firebase/firebaseClient.js`)
and verifies it with the same `firebase-admin` instance used for push
notifications (`Backend/src/notifications/firebase.js`). It links to an
existing account by email if one exists, otherwise creates a new
`authProvider: 'google'` user — issuing the exact same JWT session as phone-OTP
or email/password login. Requires `FIREBASE_SERVICE_ACCOUNT_JSON`/`_PATH`
(backend) and `VITE_FIREBASE_*` (frontend) to be set; the button shows a clear
error if Firebase isn't configured rather than failing silently.

## Check-in / check-out access codes

A production-style, staff-verified arrival/departure flow, layered on top of
the Part 2 status engine — the automatic cron transitions and this manual
code-verification path coexist:

- The moment a booking reaches **CONFIRMED**, an 8-digit check-in code is
  generated, **hashed with bcrypt** (only the hash is ever stored —
  `booking.checkInCode.hash`), and the plaintext is emailed to the guest.
- Front-desk staff verify it via AdminPanel → Bookings → **Check-in** (a code
  input, gated to `admin`/`hotelOwner`-of-that-hotel) — `POST
  /admin/bookings/:id/verify-checkin`. Success moves the booking to
  `CHECKED_IN` and immediately issues + emails a check-out code the same way.
- **Check-out** works identically (`POST /admin/bookings/:id/verify-checkout`)
  and reuses the exact same overdue/grace-period logic as guest self-checkout
  (`Backend/src/services/checkin.service.js`) — a late checkout still flips to
  `OVERDUE` and blocks completion until the penalty is paid.
- Codes are one-time-use and expire after `ACCESS_CODE_EXPIRY_HOURS` (default
  48h); staff can regenerate and re-email one via **Resend code** /
  `POST /admin/bookings/:id/resend-code?type=checkin|checkout`.
- On successful checkout, a **thank-you email** (with a return coupon) fires
  from the `COMPLETED` transition itself, so it fires identically whether
  checkout was self-service, code-verified, or fine-payment-triggered.

All templated email (booking confirmed, payment receipt, check-in/check-out
codes, thank-you) lives in `Backend/src/emails/templates/` and funnels through
`Backend/src/services/email.service.js` — no other file calls nodemailer
directly.

## Mobile navigation

- **Frontend**: the hamburger opens a full-height (`h-screen`) drawer that
  slides in from the left (`Frontend/src/components/MobileDrawer.jsx`) —
  focus-trapped, closes on backdrop click / route change / `Esc`, body scroll
  locked while open, and the Login/Logout action is pinned to the bottom via
  flex `mt-auto`.
- **AdminPanel**: the sidebar becomes the same kind of off-canvas drawer below
  the `md` breakpoint, toggled from Topbar's hamburger
  (`AdminPanel/src/components/{Sidebar,AdminLayout,Topbar}.jsx`); it stays a
  static sidebar on desktop. Admin tables scroll horizontally inside their own
  container (`.table-wrap`) rather than ever overflowing the page.

---

## Architecture notes

- **Pricing is always computed server-side** (`Backend/src/services/pricing.service.js`)
  — the client never sends a trusted total; base price × rooms + GST − coupon
  discount − wallet redemption = payable.
- **Theming**: every color in both frontend apps lives in `src/styles/theme.css`
  as CSS custom properties, light and dark. Tailwind's color tokens are mapped
  to those variables in `tailwind.config.js`. Rebranding or fixing dark mode
  is a one-file change — no component edits needed.
- **Auth**: JWT access token (short-lived, kept in memory) + httpOnly refresh
  cookie (`/api/v1/auth/refresh`). Both Frontend and AdminPanel use the same
  cookie-based refresh flow against the same Backend, so avoid staying logged
  into both apps with different accounts in the same browser profile —
  they share one refresh-token cookie per browser.
- **Roles**: `user` (guest), `hotelOwner` (own hotels/rooms/bookings/stats,
  scoped server-side in every query), `admin` (everything).

## Project structure

See `Backend/src`, `Frontend/src`, and `AdminPanel/src` — each follows a
consistent layout: `api/` (axios calls only, never call fetch/axios directly
from components), `common/` (shared UI), `components/` (feature UI),
`pages/`, `context/`, `hooks/`, `routes/`, `utils/`, `styles/theme.css`.

Backend follows a standard layered structure: `models/` (Mongoose schemas),
`controllers/`, `routes/`, `middlewares/` (auth, role guard, validation,
central error handler), `services/` (pricing, coupons, OTP, email,
availability, booking status, payment, realtime), `jobs/` (cron),
`notifications/` (DB + FCM + socket module), `utils/` (`ApiError`,
`ApiResponse`, `asyncHandler`), `seed/`.

## Environment variables reference

See `Backend/.env.example`, `Frontend/.env.example`, `AdminPanel/.env.example`
for the full list. Everything Razorpay/Firebase-related is optional and
degrades gracefully (mock payments / no push notifications) when left blank.
