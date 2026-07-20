import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MapPin, Wifi, Snowflake, Tv, Droplets, Coffee, Car, Bell, Users, Heart } from "lucide-react";
import Loader from "../common/Loader.jsx";
import EmptyState from "../common/EmptyState.jsx";
import Button from "../common/Button.jsx";
import Select from "../common/Select.jsx";
import Input from "../common/Input.jsx";
import Rating from "../common/Rating.jsx";
import Badge from "../common/Badge.jsx";
import ImageCarousel from "../components/ImageCarousel.jsx";
import { useHotelDetail, useHotelReviews, useRoomAvailability } from "../hooks/useHotels.js";
import { useAuth } from "../hooks/useAuth.js";
import { formatCurrency, formatDate, getDefaultCheckInTime } from "../utils/formatters.js";
import { DURATION_OPTIONS, FULL_DAY_DURATION, HOTEL_TAG_LABELS, AMENITY_LABELS } from "../utils/constants.js";
import { addFavourite } from "../api/user.api.js";
import toast from "react-hot-toast";

const AMENITY_ICONS = { wifi: Wifi, ac: Snowflake, tv: Tv, water: Droplets, breakfast: Coffee, parking: Car, room_service: Bell };

const todayStr = () => new Date().toISOString().split("T")[0];

const HotelDetail = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [checkInDate, setCheckInDate] = useState(searchParams.get("checkIn") || todayStr());
  const [checkInTime, setCheckInTime] = useState(searchParams.get("time") || getDefaultCheckInTime());
  const [duration, setDuration] = useState(Number(searchParams.get("duration")) || 6);
  const [adults, setAdults] = useState(Number(searchParams.get("adults")) || 2);
  const [children, setChildren] = useState(Number(searchParams.get("children")) || 0);
  const [rooms, setRooms] = useState(1);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const { data, isLoading } = useHotelDetail(slug, { checkIn: checkInDate, time: checkInTime, duration, adults, children });
  const { data: reviews } = useHotelReviews(data?.hotel?._id);

  const roomList = data?.rooms || [];
  const activeRoomId = selectedRoomId || roomList[0]?._id;
  const activeRoom = roomList.find((r) => r._id === activeRoomId);

  const slotField = { 3: "threeHr", 6: "sixHr", 12: "twelveHr", 24: "fullDay" }[duration];
  const unitPrice = activeRoom?.priceSlots?.[slotField];
  const hasSlotPrice = unitPrice != null;

  const { data: availability, isFetching: isCheckingAvailability } = useRoomAvailability(activeRoomId, {
    checkInDate,
    checkInTime,
    durationHrs: duration,
  });
  const isSoldOut = availability != null && availability.available < rooms;
  const isAvailable = hasSlotPrice && !isSoldOut;

  const priceEstimate = useMemo(() => {
    if (!isAvailable) return null;
    const base = unitPrice * rooms;
    const tax = Math.round(base * 0.12);
    return { base, tax, total: base + tax };
  }, [unitPrice, rooms, isAvailable]);

  const handleFavourite = async () => {
    if (!isAuthenticated) return navigate("/login");
    try {
      await addFavourite(data.hotel._id);
      toast.success("Added to favourites");
    } catch (e) {
      // toast already shown by the axios interceptor
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) return navigate("/login", { state: { from: { pathname: `/hotels/${slug}` } } });
    if (!isAvailable) return;
    const params = new URLSearchParams({
      hotelSlug: slug,
      roomId: activeRoomId,
      checkInDate,
      checkInTime,
      durationHrs: duration,
      adults,
      children,
      rooms,
    });
    navigate(`/booking?${params.toString()}`);
  };

  if (isLoading) return <Loader fullscreen label="Loading hotel details…" />;
  if (!data?.hotel) return <EmptyState title="Hotel not found" description="This hotel may have been removed or is temporarily unavailable." />;

  const { hotel } = data;

  return (
    <div className="container-app py-8">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text sm:text-3xl">{hotel.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-text-muted">
            <MapPin className="h-4 w-4" /> {hotel.area}, {hotel.city?.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Rating value={hotel.rating || 0} reviewCount={hotel.reviewCount} size="lg" />
          <button onClick={handleFavourite} aria-label="Save to favourites" className="rounded-xl border border-border p-2.5 hover:bg-surface-muted">
            <Heart className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ImageCarousel images={hotel.images} alt={hotel.name} aspect="aspect-[16/9]" />

          <div className="mt-6 flex flex-wrap gap-2">
            {hotel.tags?.map((tag) => <Badge key={tag}>{HOTEL_TAG_LABELS[tag] || tag}</Badge>)}
          </div>

          <div className="mt-6">
            <h2 className="font-heading text-lg font-semibold text-text">About this stay</h2>
            <p className="mt-2 text-text-muted">{hotel.description}</p>
          </div>

          <div className="mt-6">
            <h2 className="font-heading text-lg font-semibold text-text">Amenities</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {hotel.amenities?.map((a) => {
                const Icon = AMENITY_ICONS[a] || Wifi;
                return (
                  <div key={a} className="flex items-center gap-2 text-sm text-text-muted">
                    <Icon className="h-4 w-4 text-primary" /> {AMENITY_LABELS[a] || a}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="font-heading text-lg font-semibold text-text">Address</h2>
            <p className="mt-2 text-text-muted">{hotel.address}</p>
            <div className="mt-3 flex h-48 items-center justify-center rounded-xl bg-surface-muted text-sm text-text-muted">
              Map preview unavailable in demo
            </div>
          </div>

          <div className="mt-6">
            <h2 className="font-heading text-lg font-semibold text-text">Room Types</h2>
            <div className="mt-3 space-y-3">
              {roomList.map((room) => (
                <button
                  key={room._id}
                  onClick={() => setSelectedRoomId(room._id)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    activeRoomId === room._id ? "border-primary bg-primary-light/30" : "border-border bg-surface hover:bg-surface-muted"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-text">{room.type}</p>
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Users className="h-3.5 w-3.5" /> {room.capacity?.adults} adults, {room.capacity?.children} children
                    </span>
                  </div>
                  <div className="mt-2 flex gap-4 text-sm">
                    {DURATION_OPTIONS.map((opt) => (
                      <span key={opt.value} className="text-text-muted">
                        {opt.label}: {room.priceSlots?.[{ 3: "threeHr", 6: "sixHr", 12: "twelveHr" }[opt.value]] ? formatCurrency(room.priceSlots[{ 3: "threeHr", 6: "sixHr", 12: "twelveHr" }[opt.value]]) : "N/A"}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="font-heading text-lg font-semibold text-text">Guest Reviews</h2>
            {!reviews?.length ? (
              <p className="mt-2 text-sm text-text-muted">No reviews yet — be the first to stay and share feedback.</p>
            ) : (
              <div className="mt-3 space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="border-b border-border pb-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-text">{r.user?.name}</p>
                      <Rating value={r.rating} />
                    </div>
                    <p className="mt-1 text-sm text-text-muted">{r.comment}</p>
                    <p className="mt-1 text-xs text-text-muted">{formatDate(r.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card sticky top-24 space-y-4 p-5">
            <h3 className="font-heading text-base font-semibold text-text">Select your slot</h3>

            <Input type="date" label="Date" min={todayStr()} value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} />
            <Input type="time" label="Check-in Time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} />

            <Select label="Duration" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
              <option value={FULL_DAY_DURATION}>Full Day</option>
            </Select>

            <div className="grid grid-cols-3 gap-2">
              <Input type="number" min={1} label="Adults" value={adults} onChange={(e) => setAdults(Number(e.target.value))} />
              <Input type="number" min={0} label="Children" value={children} onChange={(e) => setChildren(Number(e.target.value))} />
              <Input type="number" min={1} label="Rooms" value={rooms} onChange={(e) => setRooms(Number(e.target.value))} />
            </div>

            {hasSlotPrice && availability && (
              <p className={`text-sm ${isSoldOut ? "text-danger" : "text-success"}`}>
                {isCheckingAvailability
                  ? "Checking availability…"
                  : isSoldOut
                    ? `Sold out for this slot (0 of ${availability.totalUnits} available)`
                    : `${availability.available} of ${availability.totalUnits} rooms available`}
              </p>
            )}

            {priceEstimate ? (
              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-sm text-text-muted">
                  <span>Room charges</span>
                  <span>{formatCurrency(priceEstimate.base)}</span>
                </div>
                <div className="flex justify-between text-sm text-text-muted">
                  <span>Taxes (GST)</span>
                  <span>{formatCurrency(priceEstimate.tax)}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold text-text">
                  <span>Estimated Total</span>
                  <span>{formatCurrency(priceEstimate.total)}</span>
                </div>
              </div>
            ) : (
              <p className="border-t border-border pt-4 text-sm text-danger">
                {hasSlotPrice ? "This room is sold out for the selected slot." : "This room is unavailable for the selected duration."}
              </p>
            )}

            <Button className="w-full" variant="accent" onClick={handleBookNow} disabled={!isAvailable}>
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;
