import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import Loader from "../common/Loader.jsx";
import { useCities } from "../hooks/useHotels.js";

const fallbackImage = (seed) => `https://picsum.photos/seed/staybyhour-city-${seed}/480/560`;

const AllCities = () => {
  const { data: cities, isLoading } = useCities();

  if (isLoading) return <Loader fullscreen label="Loading cities…" />;

  return (
    <div>
      <section className="relative overflow-hidden py-10 sm:py-14">
        <img
          src="https://picsum.photos/seed/staybyhour-allcities-banner/1600/500"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-hover/80 via-primary-hover/60 to-bg backdrop-blur-sm" />
        <div className="container-app relative">
          <div className="mx-auto max-w-2xl rounded-2xl bg-primary-hover/25 px-5 py-5 text-center backdrop-blur-md sm:px-8 sm:py-6">
            <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">All Cities</h1>
            <p className="mt-2 text-white/90">Hourly and full-day hotel stays across India's busiest cities.</p>
          </div>
        </div>
      </section>

      <div className="container-app py-6 sm:py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cities?.map((city) => (
            <Link
              key={city._id}
              to={`/hotels-in-${city.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-soft"
            >
              <img
                src={city.heroImage || fallbackImage(city.slug)}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-hover/85 via-primary-hover/15 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
                <div>
                  <p className="flex items-center gap-1 text-xs text-white/80">
                    <MapPin className="h-3 w-3" /> {city.state}
                  </p>
                  <p className="font-heading text-lg font-semibold text-white">{city.name}</p>
                </div>
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors group-hover:bg-accent group-hover:text-primary-hover">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllCities;
