import { Link } from "react-router-dom";
import { CITY_CHIPS } from "../utils/constants.js";

const cityImage = (city) => `https://picsum.photos/seed/staybyhour-city-${city.toLowerCase()}/480/560`;

const PopularDestinations = () => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
    {CITY_CHIPS.map((city) => (
      <Link
        key={city}
        to={`/hotels-in-${city.toLowerCase()}`}
        className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-soft"
      >
        <img
          src={cityImage(city)}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-hover/70 via-primary-hover/5 to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-lg bg-black/20 px-2.5 py-1 font-heading text-base font-semibold text-white backdrop-blur-sm sm:text-lg">
          {city}
        </span>
      </Link>
    ))}
  </div>
);

export default PopularDestinations;
