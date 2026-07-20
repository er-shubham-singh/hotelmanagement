import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import ImageCarousel from "./ImageCarousel.jsx";
import Rating from "../common/Rating.jsx";
import Badge from "../common/Badge.jsx";
import { formatCurrency } from "../utils/formatters.js";
import { HOTEL_TAG_LABELS } from "../utils/constants.js";

const SLOT_LABELS = [
  { key: "threeHr", label: "3 Hrs" },
  { key: "sixHr", label: "6 Hrs" },
  { key: "twelveHr", label: "12 Hrs" },
];

const HotelCard = ({ hotel }) => {
  const visibleTags = hotel.tags?.slice(0, 2) || [];
  const extraTagCount = (hotel.tags?.length || 0) - visibleTags.length;

  return (
    <Link to={`/hotels/${hotel.slug}`} className="card card-hover flex flex-col overflow-hidden sm:flex-row">
      <div className="sm:w-64 sm:flex-shrink-0 p-3">
        <ImageCarousel images={hotel.images} alt={hotel.name} />
      </div>

      <div className="flex flex-1 flex-col p-4 sm:pl-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-heading text-lg font-semibold text-text">{hotel.name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-text-muted">
              <MapPin className="h-3.5 w-3.5" /> {hotel.area}, {hotel.city?.name}
            </p>
          </div>
          <Rating value={hotel.rating || 0} reviewCount={hotel.reviewCount} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <Badge key={tag}>{HOTEL_TAG_LABELS[tag] || tag}</Badge>
          ))}
          {extraTagCount > 0 && <Badge>+{extraTagCount} more</Badge>}
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
          <div className="flex gap-4">
            {SLOT_LABELS.map((slot) => {
              const price = hotel.priceSlots?.[slot.key];
              return (
                <div key={slot.key} className="text-center">
                  <p className="text-xs text-text-muted">{slot.label}</p>
                  <p className={`text-sm font-semibold ${price ? "text-text" : "text-text-muted"}`}>
                    {price ? formatCurrency(price) : "Unavailable"}
                  </p>
                </div>
              );
            })}
          </div>
          <span className="btn-outline text-sm">View Details</span>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
