import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { KeyRound, XCircle, IndianRupee, RefreshCw } from "lucide-react";
import Loader from "../common/Loader.jsx";
import EmptyState from "../common/EmptyState.jsx";
import Badge from "../common/Badge.jsx";
import Select from "../common/Select.jsx";
import Modal from "../common/Modal.jsx";
import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";
import {
  listAllBookings,
  cancelBooking,
  issueRefund,
  verifyCheckInCode,
  verifyCheckOutCode,
  resendAccessCode,
} from "../api/booking.api.js";

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

const STATUS_OPTIONS = ["ACCEPTED", "CONFIRMED", "ACTIVE", "CHECKED_IN", "COMPLETED", "OVERDUE", "NO_SHOW", "CANCELLED", "EXPIRED"];

const Bookings = () => {
  const [status, setStatus] = useState("");
  const [refundTarget, setRefundTarget] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [codeModal, setCodeModal] = useState(null); // { booking, type: "checkin" | "checkout" }
  const [codeInput, setCodeInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-bookings", status],
    queryFn: async () => (await listAllBookings({ status: status || undefined, limit: 50 })).data.data,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });

  const handleCancel = async (id) => {
    if (!confirm("Cancel this booking? This will process a refund per policy.")) return;
    try {
      await cancelBooking(id, "Cancelled by admin");
      toast.success("Booking cancelled");
      refresh();
    } catch (error) {
      // handled by interceptor
    }
  };

  const submitRefund = async () => {
    if (!refundAmount || Number(refundAmount) <= 0) return toast.error("Enter a valid amount");
    try {
      await issueRefund(refundTarget._id, Number(refundAmount), "Manual admin refund");
      toast.success("Refund issued");
      setRefundTarget(null);
      setRefundAmount("");
      refresh();
    } catch (error) {
      // handled by interceptor
    }
  };

  const openCodeModal = (booking, type) => {
    setCodeInput("");
    setCodeModal({ booking, type });
  };

  const submitCodeVerification = async () => {
    if (!codeInput.trim()) return toast.error("Enter the code");
    setIsVerifying(true);
    try {
      if (codeModal.type === "checkin") {
        await verifyCheckInCode(codeModal.booking._id, codeInput.trim());
        toast.success("Check-in verified — guest is checked in");
      } else {
        await verifyCheckOutCode(codeModal.booking._id, codeInput.trim());
        toast.success("Check-out verified — stay completed");
      }
      setCodeModal(null);
      refresh();
    } catch (error) {
      // interceptor shows the error toast (invalid/expired code, or overdue-fine block on checkout)
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendAccessCode(codeModal.booking._id, codeModal.type);
      toast.success(`New ${codeModal.type === "checkin" ? "check-in" : "check-out"} code emailed to the guest`);
    } catch (error) {
      // handled by interceptor
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-48">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <Loader label="Loading bookings…" />
      ) : !data?.bookings?.length ? (
        <EmptyState title="No bookings found" />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Guest</th>
                <th>Hotel</th>
                <th>Check-in</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.bookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="font-mono text-xs text-text">{booking.bookingRef}</td>
                  <td>{booking.user?.name}<br /><span className="text-xs text-text-muted">{booking.user?.phone}</span></td>
                  <td>{booking.hotel?.name}</td>
                  <td>{new Date(booking.checkInDate).toLocaleDateString("en-IN")} {booking.checkInTime}</td>
                  <td>
                    ₹{booking.priceBreakdown?.payable}
                    {booking.status === "OVERDUE" && <div className="text-xs text-danger">+₹{booking.penaltyAmount} penalty</div>}
                  </td>
                  <td>
                    <Badge className={STATUS_COLORS[booking.status]}>{booking.status?.replace("_", " ")}</Badge>
                  </td>
                  <td>
                    <div className="flex justify-end gap-1.5">
                      {["CONFIRMED", "ACTIVE"].includes(booking.status) && (
                        <button
                          onClick={() => openCodeModal(booking, "checkin")}
                          title="Verify check-in code"
                          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-primary hover:bg-surface-muted"
                        >
                          <KeyRound className="h-3.5 w-3.5" /> Check-in
                        </button>
                      )}
                      {["CHECKED_IN", "OVERDUE"].includes(booking.status) && (
                        <button
                          onClick={() => openCodeModal(booking, "checkout")}
                          title="Verify check-out code"
                          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-success hover:bg-surface-muted"
                        >
                          <KeyRound className="h-3.5 w-3.5" /> Check-out
                        </button>
                      )}
                      {["ACCEPTED", "CONFIRMED", "ACTIVE"].includes(booking.status) && (
                        <button onClick={() => handleCancel(booking._id)} title="Cancel" className="rounded-lg p-1.5 text-danger hover:bg-surface-muted">
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => setRefundTarget(booking)} title="Issue refund" className="rounded-lg p-1.5 text-text-muted hover:bg-surface-muted">
                        <IndianRupee className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!refundTarget} onClose={() => setRefundTarget(null)} title={`Issue Refund — ${refundTarget?.bookingRef || ""}`}>
        <div className="space-y-4">
          <Input
            type="number"
            label="Refund amount (₹)"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            placeholder="e.g. 500"
          />
          <p className="text-xs text-text-muted">Credited directly to the guest's StayByHour wallet.</p>
          <Button className="w-full" onClick={submitRefund}>
            Issue Refund
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={!!codeModal}
        onClose={() => setCodeModal(null)}
        title={codeModal?.type === "checkin" ? "Verify Check-in Code" : "Verify Check-out Code"}
      >
        {codeModal && (
          <div className="space-y-4">
            <p className="text-sm text-text-muted">
              Ask the guest for the {codeModal.type === "checkin" ? "check-in" : "check-out"} code emailed to them for
              booking <span className="font-mono font-medium text-text">{codeModal.booking.bookingRef}</span>.
            </p>
            <Input
              label="Code"
              placeholder="8-digit code"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              autoFocus
            />
            <Button className="w-full" isLoading={isVerifying} onClick={submitCodeVerification}>
              Verify &amp; {codeModal.type === "checkin" ? "Check In" : "Check Out"}
            </Button>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="flex w-full items-center justify-center gap-1.5 text-sm text-text-muted hover:text-primary disabled:opacity-60"
            >
              <RefreshCw className="h-3.5 w-3.5" /> {isResending ? "Resending…" : "Resend code to guest"}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Bookings;
