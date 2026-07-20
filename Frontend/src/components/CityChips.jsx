import { Link } from "react-router-dom";
import { CITY_CHIPS } from "../utils/constants.js";

const CityChips = () => (
  <div className="flex flex-wrap justify-center gap-2">
    {[...CITY_CHIPS, "All Cities"].map((city) => (
      <Link
        key={city}
        to={city === "All Cities" ? "/all-cities" : `/hotels-in-${city.toLowerCase()}`}
        className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:border-primary hover:text-primary"
      >
        {city}
      </Link>
    ))}
  </div>
);

export default CityChips;
