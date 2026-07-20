import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Tag, Wallet, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";
import Loader from "../common/Loader.jsx";
import BookingSummary from "../components/BookingSummary.jsx";
import PaymentPanel from "../components/PaymentPanel.jsx";
import { useHotelDetail } from "../hooks/useHotels.js";
import { useAuth } from "../hooks/useAuth.js";
import { validateOffer } from "../api/offer.api.js";
import { getWallet } from "../api/user.api.js";
import { createBooking } from "../api/booking.api.js";
import { formatCurrency } from "../utils/formatters.js";

const TAX_RATE = 0.12;

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const roomId = searchParams.get("roomId");
  const checkInDate = searchParams.get("checkInDate");
  const checkInTime = searchParams.get("checkInTime");
  const durationHrs = Number(searchParams.get("durationHrs"));
  const adults = Number(searchParams.get("adults")) || 1;
  const children = Number(searchParams.get("children")) || 0;
  const rooms = Number(searchParams.get("rooms")) || 1;

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [useWalletAmount, setUseWalletAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const idempotencyKey = useRef(crypto.randomUUID());

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name || "", phone: user?.phone || "", email: user?.email || "" },
  });

  // We need the hotel/room context; the room ID alone isn't enough to find the hotel slug,
  // so this page is reached only via HotelDetail's "Book Now" (which knows the slug) —
  // but we accept a slug param too for direct linking/testing.
  const hotelSlug = searchParams.get("hotelSlug");
  const { data: hotelData, isLoading } = useHotelDetail(hotelSlug, {});
  const room = hotelData?.rooms?.find((r) => r._id === roomId);
  const hotel = hotelData?.hotel;

  const { data: wallet } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => (await getWallet()).data.data.wallet,
  });

  const slotField = { 3: "threeHr", 6: "sixHr", 12: "twelveHr", 24: "fullDay" }[durationHrs];
  const unitPrice = room?.priceSlots?.[slotField];

  const pricing = useMemo(() => {
    if (!unitPrice) return null;
    const base = unitPrice * rooms;
    const tax = Math.round(base * TAX_RATE);
    const discount = appliedCoupon ? Math.min(appliedCoupon.discount, base + tax) : 0;
    const afterDiscount = base + tax - discount;
    const walletUsed = Math.min(useWalletAmount, afterDiscount, wallet?.balance || 0);
    const payable = Math.max(0, afterDiscount - walletUsed);
    return { base, tax, discount, walletUsed, payable };
  }, [unitPrice, rooms, appliedCoupon, useWalletAmount, wallet]);

  useEffect(() => {
    if (createdBooking?.status === "CONFIRMED") {
      navigate(`/booking-confirmation/${createdBooking.bookingRef}`, { replace: true });
    }
  }, [createdBooking, navigate]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !pricing) return;
    setIsApplyingCoupon(true);
    try {
      const amount = pricing.base + pricing.tax;
      const { data } = await validateOffer(couponCode.trim(), amount);
      setAppliedCoupon({ code: couponCode.trim().toUpperCase(), discount: data.data.discount });
      toast.success(`Coupon applied: -${formatCurrency(data.data.discount)}`);
    } catch (error) {
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const onSubmit = async (guestValues) => {
    if (!room) return;
    setIsSubmitting(true);
    try {
      const { data } = await createBooking({
        roomId,
        checkInDate,
        checkInTime,
        durationHrs,
        adults,
        children,
        rooms,
        guest: guestValues,
        couponCode: appliedCoupon?.code,
        useWallet: pricing.walletUsed,
        idempotencyKey: idempotencyKey.current,
      });
      setCreatedBooking(data.data.booking);
      if (data.data.booking.status === "CONFIRMED") {
        toast.success("Booking confirmed!");
      } else {
        toast.success("Slot held — complete payment to confirm your booking");
      }
    } catch (error) {
      // handled by interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loader fullscreen label="Preparing your booking…" />;

  // Booking created and awaiting payment — hand off to PaymentPanel.
  if (createdBooking && createdBooking.status === "ACCEPTED") {
    return (
      <div className="container-app py-8">
        <div className="mx-auto max-w-lg">
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-primary-light/40 px-4 py-3 text-sm text-primary">
            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
            Your slot is held for 10 minutes — complete payment to confirm booking {createdBooking.bookingRef}.
          </div>
          <div className="card p-6">
            <PaymentPanel
              bookingId={createdBooking._id}
              bookingRef={createdBooking.bookingRef}
              amount={createdBooking.priceBreakdown.payable}
              guest={createdBooking.guest}
              onPaid={() => navigate(`/booking-confirmation/${createdBooking.bookingRef}`)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <h1 className="mb-6 font-heading text-2xl font-bold text-text">Complete Your Booking</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 lg:col-span-2">
          <div className="card p-5">
            <h2 className="mb-4 font-heading text-base font-semibold text-text">Guest Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full Name" error={errors.name?.message} {...register("name", { required: "Name is required" })} />
              <Input label="Phone Number" error={errors.phone?.message} {...register("phone", { required: "Phone is required" })} />
              <Input label="Email (optional)" className="sm:col-span-2" {...register("email")} />
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-4 font-heading text-base font-semibold text-text">Apply Coupon</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Enter coupon code"
                icon={Tag}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <Button type="button" variant="outline" isLoading={isApplyingCoupon} onClick={handleApplyCoupon}>
                Apply
              </Button>
            </div>
            {appliedCoupon && (
              <p className="mt-2 text-sm text-success">
                {appliedCoupon.code} applied — you saved {formatCurrency(appliedCoupon.discount)}
              </p>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-4 flex items-center gap-2 font-heading text-base font-semibold text-text">
              <Wallet className="h-4 w-4" /> Use Wallet Balance
            </h2>
            <p className="text-sm text-text-muted">Available balance: {formatCurrency(wallet?.balance || 0)}</p>
            <input
              type="range"
              min={0}
              max={wallet?.balance || 0}
              value={useWalletAmount}
              onChange={(e) => setUseWalletAmount(Number(e.target.value))}
              className="mt-3 w-full accent-primary"
            />
            <p className="mt-1 text-sm font-medium text-text">Using {formatCurrency(useWalletAmount)}</p>
          </div>

          <Button type="submit" variant="accent" className="w-full" isLoading={isSubmitting} disabled={!pricing}>
            {pricing?.payable === 0 ? "Confirm Booking" : `Continue to Payment · ${pricing ? formatCurrency(pricing.payable) : ""}`}
          </Button>
        </form>

        <div>
          <BookingSummary
            hotel={hotel}
            room={room}
            checkInDate={checkInDate}
            checkInTime={checkInTime}
            durationHrs={durationHrs}
            pricing={pricing}
          />
        </div>
      </div>
    </div>
  );
};

export default Booking;
