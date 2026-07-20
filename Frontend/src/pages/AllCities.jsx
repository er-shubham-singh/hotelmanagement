import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import Loader from "../common/Loader.jsx";
import { useCities } from "../hooks/useHotels.js";

const AllCities = () => {
  const { data: cities, isLoading } = useCities();

  if (isLoading) return <Loader fullscreen label="Loading cities…" />;

  return (
    <div className="container-app py-14">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-3xl font-bold text-text">All Cities</h1>
        <p className="mt-2 text-text-muted">Hourly and full-day hotel stays across India.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cities?.map((city) => (
          <Link
            key={city._id}
            to={`/hotels-in-${city.slug}`}
            className="card card-hover flex items-center gap-3 p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-text">{city.name}</p>
              <p className="text-xs text-text-muted">{city.state}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AllCities;
