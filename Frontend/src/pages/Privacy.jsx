const Privacy = () => (
  <div className="container-app max-w-3xl py-14">
    <h1 className="font-heading text-3xl font-bold text-text">Privacy Policy</h1>
    <div className="mt-6 space-y-4 text-text-muted">
      <p>
        We collect your name, phone number, and email to create your account, process bookings, and send
        booking-related communication. Phone numbers are verified via a one-time password (OTP) at signup.
      </p>
      <p>
        Payment details are handled by third-party payment processors in production deployments; StayByHour does
        not store raw card numbers. This demo environment uses a mock payment flow and processes no real
        transactions.
      </p>
      <p>
        Booking and contact data may be shared with the relevant partner hotel solely to fulfil your reservation.
        We do not sell personal data to third parties.
      </p>
      <p>
        You may request account deletion or data export at any time by contacting support@staybyhour.com.
      </p>
    </div>
  </div>
);

export default Privacy;
