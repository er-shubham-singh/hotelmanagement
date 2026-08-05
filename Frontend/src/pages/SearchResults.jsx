import { useMemo, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Wifi, Snowflake, Tv, Droplets } from "lucide-react";
import HotelCard from "../components/HotelCard.jsx";
import FilterSidebar, { activeFilterCount } from "../components/FilterSidebar.jsx";
import Loader from "../common/Loader.jsx";
import EmptyState from "../common/EmptyState.jsx";
import Select from "../common/Select.jsx";
import Button from "../common/Button.jsx";
import Badge from "../common/Badge.jsx";
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
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

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
    <div>
      <section className="relative overflow-hidden py-10 sm:py-12">
        <img
          src={`https://picsum.photos/seed/staybyhour-city-${citySlug}/1600/500`}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-hover/80 via-primary-hover/60 to-bg backdrop-blur-sm" />
        <div className="container-app relative">
          <div className="mx-auto max-w-2xl rounded-2xl bg-primary-hover/25 px-5 py-5 text-center backdrop-blur-md sm:px-8 sm:py-6">
            <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">Hourly Hotels in {cityLabel}</h1>
            <p className="mt-1 text-white/90">{data?.total ?? 0} properties found</p>
          </div>
        </div>
      </section>

      <div className="container-app pt-6 pb-0">
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-muted">
        <span>Standard amenities:</span>
        {AMENITY_ICONS.map((a) => (
          <Badge key={a.label} className="gap-1">
            <a.icon className="h-3.5 w-3.5" /> {a.label}
          </Badge>
        ))}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          areas={areas}
          mobileOpen={isFilterSheetOpen}
          onMobileOpenChange={setIsFilterSheetOpen}
        />

        <div className="flex-1">
          <div className="mb-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFilterSheetOpen(true)}
              aria-label="Open filters"
              className="btn-outline relative flex-shrink-0 px-3 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount(filters) > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white">
                  {activeFilterCount(filters)}
                </span>
              )}
            </button>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} className="flex-1 lg:ml-auto lg:max-w-48 lg:flex-none">
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
    </div>
  );
};

export default SearchResults;
