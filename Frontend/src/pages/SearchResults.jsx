import { useMemo, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Wifi, Snowflake, Tv, Droplets } from "lucide-react";
import HotelCard from "../components/HotelCard.jsx";
import FilterSidebar from "../components/FilterSidebar.jsx";
import Loader from "../common/Loader.jsx";
import EmptyState from "../common/EmptyState.jsx";
import Select from "../common/Select.jsx";
import Button from "../common/Button.jsx";
import { useHotelSearch } from "../hooks/useHotels.js";
import { useDebounce } from "../hooks/useDebounce.js";

const AMENITY_ICONS = [
  { icon: Wifi, label: "WiFi" },
  { icon: Snowflake, label: "AC" },
  { icon: Tv, label: "TV" },
  { icon: Droplets, label: "Water" },
];

const PAGE_SIZE = 8;

const SearchResults = () => {
  const { citySlug: rawSlug } = useParams();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("recommended");
  const [filters, setFilters] = useState({ area: "", minPrice: "", maxPrice: "", tags: [] });

  const debouncedMin = useDebounce(filters.minPrice);
  const debouncedMax = useDebounce(filters.maxPrice);

  // URLs look like /hotels-in-mumbai — React Router v6 can't mix static text and a
  // param within one segment, so this route is registered as "/:citySlug" and we
  // pull the city out of the "hotels-in-" prefix ourselves.
  const match = /^hotels-in-(.+)$/i.exec(rawSlug || "");
  if (!match) return <Navigate to="/404" replace />;
  const citySlug = match[1].toLowerCase();

  const params = useMemo(
    () => ({
      city: citySlug,
      area: filters.area || undefined,
      minPrice: debouncedMin || undefined,
      maxPrice: debouncedMax || undefined,
      tags: filters.tags.length ? filters.tags.join(",") : undefined,
      sort,
      page,
      limit: PAGE_SIZE,
      checkIn: searchParams.get("checkIn") || undefined,
      time: searchParams.get("time") || undefined,
      duration: searchParams.get("duration") || undefined,
    }),
    [citySlug, filters, debouncedMin, debouncedMax, sort, page, searchParams]
  );

  const { data, isLoading, isFetching } = useHotelSearch(params);
  const hotels = data?.hotels || [];
  const areas = useMemo(() => [...new Set(hotels.map((h) => h.area))], [hotels]);

  const cityLabel = citySlug ? citySlug.charAt(0).toUpperCase() + citySlug.slice(1) : "your city";

  return (
    <div className="container-app py-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-text sm:text-3xl">Hourly Hotels in {cityLabel}</h1>
        <p className="mt-1 text-text-muted">{data?.total ?? 0} properties found</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-muted">
        <SlidersHorizontal className="h-4 w-4" />
        Standard amenities across our partner hotels:
        {AMENITY_ICONS.map((a) => (
          <span key={a.label} className="flex items-center gap-1">
            <a.icon className="h-3.5 w-3.5" /> {a.label}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <FilterSidebar filters={filters} onChange={setFilters} areas={areas} />

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-end">
            <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-48">
              <option value="recommended">Recommended</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="newest">Newest</option>
            </Select>
          </div>

          {isLoading ? (
            <Loader label="Finding the best stays for you…" />
          ) : hotels.length === 0 ? (
            <EmptyState
              title="No hotels match your filters"
              description="Try widening your price range or clearing a few filters."
            />
          ) : (
            <>
              <div className="space-y-4">
                {hotels.map((hotel) => (
                  <HotelCard key={hotel._id} hotel={hotel} />
                ))}
              </div>

              {data?.pages > page && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline" isLoading={isFetching} onClick={() => setPage((p) => p + 1)}>
                    Load more hotels
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
