import { formatCurrency, formatDate, formatTime, durationLabel } from "../utils/formatters.js";

const Row = ({ label, value, muted = false, strong = false }) => (
  <div className="flex items-center justify-between py-1.5 text-sm">
    <span className={muted ? "text-text-muted" : "text-text"}>{label}</span>
    <span className={strong ? "font-semibold text-text" : "text-text"}>{value}</span>
  </div>
);

const BookingSummary = ({ hotel, room, checkInDate, checkInTime, durationHrs, pricing }) => (
  <div className="card sticky top-24 p-5">
    <h3 className="font-heading text-base font-semibold text-text">Booking Summary</h3>

    {hotel && (
      <div className="mt-3 border-b border-border pb-3">
        <p className="font-medium text-text">{hotel.name}</p>
        <p className="text-sm text-text-muted">{room?.type}</p>
      </div>
    )}

    <div className="border-b border-border py-2">
      <Row label="Check-in" value={`${formatDate(checkInDate)}, ${formatTime(checkInTime)}`} muted />
      <Row label="Duration" value={durationLabel(durationHrs)} muted />
    </div>

    {pricing && (
      <div className="pt-2">
        <Row label="Room charges" value={formatCurrency(pricing.base)} />
        <Row label="Taxes (GST)" value={formatCurrency(pricing.tax)} />
        {pricing.discount > 0 && <Row label="Coupon discount" value={`- ${formatCurrency(pricing.discount)}`} />}
        {pricing.walletUsed > 0 && <Row label="Wallet used" value={`- ${formatCurrency(pricing.walletUsed)}`} />}
        <div className="mt-2 border-t border-border pt-2">
          <Row label="Total Payable" value={formatCurrency(pricing.payable)} strong />
        </div>
      </div>
    )}
  </div>
);

export default BookingSummary;
