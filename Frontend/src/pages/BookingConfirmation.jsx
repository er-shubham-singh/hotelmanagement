import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Calendar, Clock, MapPin } from "lucide-react";
import Loader from "../common/Loader.jsx";
import EmptyState from "../common/EmptyState.jsx";
import Button from "../common/Button.jsx";
import { getBookingByRef } from "../api/booking.api.js";
import { formatCurrency, formatDate, formatTime, durationLabel } from "../utils/formatters.js";

const BookingConfirmation = () => {
  const { ref } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["booking", ref],
    queryFn: async () => (await getBookingByRef(ref)).data.data.booking,
  });

  if (isLoading) return <Loader fullscreen label="Fetching your booking…" />;
  if (!data) return <EmptyState title="Booking not found" />;

  return (
    <div className="container-app flex justify-center py-12">
      <div className="w-full max-w-xl">
        <div className="card p-6 text-center sm:p-8">
          <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
          <h1 className="mt-4 font-heading text-2xl font-bold text-text">Booking Confirmed!</h1>
          <p className="mt-1 text-text-muted">Reference ID: <span className="font-mono font-medium text-text">{data.bookingRef}</span></p>

          <div className="mt-6 space-y-3 rounded-xl bg-surface-muted p-5 text-left">
            <p className="font-medium text-text">{data.hotel?.name}</p>
            <p className="flex items-center gap-1.5 text-sm text-text-muted">
              <MapPin className="h-4 w-4" /> {data.hotel?.area}, {data.hotel?.address}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-text-muted">
              <Calendar className="h-4 w-4" /> {formatDate(data.checkInDate)}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-text-muted">
              <Clock className="h-4 w-4" /> {formatTime(data.checkInTime)} · {durationLabel(data.durationHrs)}
            </p>
          </div>

          <div className="mt-6 space-y-1.5 text-left text-sm">
            <div className="flex justify-between text-text-muted">
              <span>Room charges</span>
              <span>{formatCurrency(data.priceBreakdown.base)}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Taxes</span>
              <span>{formatCurrency(data.priceBreakdown.tax)}</span>
            </div>
            {data.priceBreakdown.discount > 0 && (
              <div className="flex justify-between text-text-muted">
                <span>Coupon discount</span>
                <span>- {formatCurrency(data.priceBreakdown.discount)}</span>
              </div>
            )}
            {data.priceBreakdown.walletUsed > 0 && (
              <div className="flex justify-between text-text-muted">
                <span>Wallet used</span>
                <span>- {formatCurrency(data.priceBreakdown.walletUsed)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 font-semibold text-text">
              <span>Total Paid</span>
              <span>{formatCurrency(data.priceBreakdown.payable)}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/dashboard/bookings" className="btn-outline flex-1">
              View My Bookings
            </Link>
            <Link to="/" className="flex-1">
              <Button className="w-full">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
