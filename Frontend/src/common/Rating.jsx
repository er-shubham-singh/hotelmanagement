import { Star } from "lucide-react";

const Rating = ({ value = 0, reviewCount, size = "sm" }) => {
  const dims = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex items-center gap-1 rounded-md bg-primary px-1.5 py-0.5 text-xs font-semibold text-white">
        {value.toFixed(1)}
        <Star className={`${dims} fill-white`} />
      </span>
      {reviewCount != null && <span className="text-xs text-text-muted">({reviewCount} reviews)</span>}
    </div>
  );
};

export default Rating;
