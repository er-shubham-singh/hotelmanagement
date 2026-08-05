import { Star } from "lucide-react";

// `stacked` puts the review count on its own line below the star badge —
// use it wherever the rating sits in a narrow column (e.g. hotel cards),
// so "(N reviews)" never wraps awkwardly mid-parenthesis.
const Rating = ({ value = 0, reviewCount, size = "sm", stacked = false }) => {
  const dims = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className={`flex ${stacked ? "flex-col items-end gap-1" : "items-center gap-1.5"}`}>
      <span className="flex flex-shrink-0 items-center gap-1 rounded-md bg-primary px-1.5 py-0.5 text-xs font-semibold text-white">
        {value.toFixed(1)}
        <Star className={`${dims} fill-white`} />
      </span>
      {reviewCount != null && (
        <span className="whitespace-nowrap text-xs text-text-muted">({reviewCount} reviews)</span>
      )}
    </div>
  );
};

export default Rating;
