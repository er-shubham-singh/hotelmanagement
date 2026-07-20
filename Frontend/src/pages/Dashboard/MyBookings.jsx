import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Calendar, Clock, MapPin, Download, KeyRound, CalendarClock, CreditCard, Star } from "lucide-react";
import Loader from "../../common/Loader.jsx";
import EmptyState from "../../common/EmptyState.jsx";
import Button from "../../common/Button.jsx";
import Badge from "../../common/Badge.jsx";
import Modal from "../../common/Modal.jsx";
import Input from "../../common/Input.jsx";
import Select from "../../common/Select.jsx";
import PaymentPanel from "../../components/PaymentPanel.jsx";
import { getMyBookings, cancelBooking, rescheduleBooking } from "../../api/booking.api.js";
import { formatCurrency, formatDate, formatTime, durationLabel } from "../../utils/formatters.js";
import { env } from "../../config/env.js";
import { DURATION_OPTIONS } from "../../utils/constants.js";
import { useSocketEvent } from "../../hooks/useSocket.js";

const TABS = [
  { value: "", label: "All" },
  { value: "ACCEPTED", label: "Awaiting Payment" },
  { value: "CONFIRMED", label: "Upcoming" },
  { value: "CHECKED_IN", label: "Checked In" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const STATUS_COLORS = {
  ACCEPTED: "text-warning",
  CONFIRMED: "text-primary",
  ACTIVE: "text-primary",
  CHECKED_IN: "text-success",
  COMPLETED: "text-success",
  OVERDUE: "text-danger",
  NO_SHOW: "text-danger",
  CANCELLED: "text-danger",
  EXPIRED: "text-text-muted",
};

const MyBookings = () => {
  const [status, setStatus] = useState("");
  const [payModal, setPayModal] = useState(null); // { booking, mode }
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ checkInDate: "", checkInTime: "", durationHrs: 6 });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["my-bookings", status],
    queryFn: async () => (await getMyBookings(status || undefined)).data.data.bookings,
    // Socket updates are the primary live signal; this is just a safety net
    // in case a connection drops (e.g. cron flips a status while offline).
    refetchInterval: 60 * 1000,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["my-bookings"] });

  // The backend emits this the instant a booking's status changes — whether
  // triggered by a cron job (e.g. the check-in window opening), a payment,
  // or a staff member verifying a check-in/checkout code in AdminPanel. Without
  // this, the page only ever reflects state as of the last manual click/reload.
  useSocketEvent(
    "booking:statusUpdate",
    (payload) => {
      refresh();
      const label = payload.status?.replace("_", " ").toLowerCase();
      if (label) toast(`Booking status updated: ${label}`, { icon: "🔄" });
    },
    []
  );

  const handleCancel = async (id) => {
    try {
      await cancelBooking(id, "Cancelled by user from dashboard");
      toast.success("Booking cancelled");
      refresh();
    } catch (error) {
      // handled by interceptor
    }
  };

  const openReschedule = (booking) => {
    setRescheduleForm({ checkInDate: booking.checkInDate.split("T")[0], checkInTime: booking.checkInTime, durationHrs: booking.durationHrs });
    setRescheduleModal(booking);
  };

  const submitReschedule = async () => {
    try {
      await rescheduleBooking(rescheduleModal._id, rescheduleForm);
      toast.success("Booking rescheduled");
      setRescheduleModal(null);
      refresh();
    } catch (error) {
      // handled by interceptor
    }
  };

  return (
    <div>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatus(t.value)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
              status === t.value ? "bg-primary text-white" : "bg-surface-muted text-text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loader label="Loading your bookings…" />
      ) : !data?.length ? (
        <EmptyState
          title="No bookings yet"
          description="Once you book a stay, it'll show up here."
          action={
            <Link to="/">
              <Button>Find a Hotel</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {data.map((booking) => (
            <div key={booking._id} className="card p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <p className="font-heading font-semibold text-text">{booking.hotel?.name}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-text-muted">
                    <MapPin className="h-3.5 w-3.5" /> {booking.hotel?.area}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-text-muted">
                    <Calendar className="h-3.5 w-3.5" /> {formatDate(booking.checkInDate)}
                    <Clock className="ml-2 h-3.5 w-3.5" /> {formatTime(booking.checkInTime)} · {durationLabel(booking.durationHrs)}
                  </p>
                  <p className="mt-2 font-mono text-xs text-text-muted">{booking.bookingRef}</p>
                </div>
                <div className="text-right">
                  <Badge className={STATUS_COLORS[booking.status]}>{booking.status.replace("_", " ")}</Badge>
                  <p className="mt-2 font-semibold text-text">{formatCurrency(booking.priceBreakdown.payable)}</p>
                  {booking.status === "OVERDUE" && (
                    <p className="mt-1 text-xs font-medium text-danger">Penalty: {formatCurrency(booking.penaltyAmount)}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-end gap-2">
                {booking.status === "ACCEPTED" && (
                  <>
                    <Button variant="outline" onClick={() => handleCancel(booking._id)}>
                      Cancel Hold
                    </Button>
                    <Button variant="accent" onClick={() => setPayModal({ booking, mode: "booking" })}>
                      <CreditCard className="h-4 w-4" /> Complete Payment
                    </Button>
                  </>
                )}

                {booking.status === "CONFIRMED" && (
                  <>
                    <Button variant="outline" onClick={() => handleCancel(booking._id)}>
                      Cancel Booking
                    </Button>
                    <Button variant="outline" onClick={() => openReschedule(booking)}>
                      <CalendarClock className="h-4 w-4" /> Reschedule
                    </Button>
                  </>
                )}

                {booking.status === "ACTIVE" && (
                  <p className="flex items-center gap-1.5 text-sm text-text-muted">
                    <KeyRound className="h-4 w-4" /> Show your check-in code (emailed to you) to the property staff to check in
                  </p>
                )}

                {booking.status === "CHECKED_IN" && (
                  <p className="flex items-center gap-1.5 text-sm text-text-muted">
                    <KeyRound className="h-4 w-4" /> Show your check-out code (emailed to you) to the property staff to check out
                  </p>
                )}

                {booking.status === "OVERDUE" && (
                  <Button variant="accent" onClick={() => setPayModal({ booking, mode: "fine" })}>
                    <CreditCard className="h-4 w-4" /> Pay Fine &amp; Check Out
                  </Button>
                )}

                {booking.status === "COMPLETED" && (
                  <>
                    {booking.invoiceUrl && (
                      <a href={`${env.apiBaseUrl.replace("/api/v1", "")}${booking.invoiceUrl}`} target="_blank" rel="noreferrer">
                        <Button variant="outline">
                          <Download className="h-4 w-4" /> Invoice
                        </Button>
                      </a>
                    )}
                    <Link to={`/hotels/${booking.hotel?.slug}`}>
                      <Button variant="outline">
                        <Star className="h-4 w-4" /> Write a Review
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!payModal} onClose={() => setPayModal(null)} title={payModal?.mode === "fine" ? "Pay Overdue Penalty" : "Complete Payment"}>
        {payModal && (
          <PaymentPanel
            bookingId={payModal.booking._id}
            bookingRef={payModal.booking.bookingRef}
            amount={payModal.mode === "fine" ? payModal.booking.penaltyAmount : payModal.booking.priceBreakdown.payable}
            guest={payModal.booking.guest}
            mode={payModal.mode}
            onPaid={() => {
              setPayModal(null);
              refresh();
            }}
          />
        )}
      </Modal>

      <Modal isOpen={!!rescheduleModal} onClose={() => setRescheduleModal(null)} title="Reschedule Booking">
        {rescheduleModal && (
          <div className="space-y-4">
            <Input
              type="date"
              label="New Date"
              min={new Date().toISOString().split("T")[0]}
              value={rescheduleForm.checkInDate}
              onChange={(e) => setRescheduleForm((f) => ({ ...f, checkInDate: e.target.value }))}
            />
            <Input
              type="time"
              label="New Check-in Time"
              value={rescheduleForm.checkInTime}
              onChange={(e) => setRescheduleForm((f) => ({ ...f, checkInTime: e.target.value }))}
            />
            <Select
              label="Duration"
              value={rescheduleForm.durationHrs}
              onChange={(e) => setRescheduleForm((f) => ({ ...f, durationHrs: Number(e.target.value) }))}
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
              <option value={24}>Full Day</option>
            </Select>
            <Button className="w-full" onClick={submitReschedule}>
              Confirm Reschedule
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyBookings;
