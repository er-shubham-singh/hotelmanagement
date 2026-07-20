import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Heart, MapPin } from "lucide-react";
import Loader from "../../common/Loader.jsx";
import EmptyState from "../../common/EmptyState.jsx";
import Rating from "../../common/Rating.jsx";
import { getFavourites, removeFavourite } from "../../api/user.api.js";

const Favourites = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["favourites"],
    queryFn: async () => (await getFavourites()).data.data.favourites,
  });

  const handleRemove = async (hotelId) => {
    await removeFavourite(hotelId);
    queryClient.invalidateQueries({ queryKey: ["favourites"] });
  };

  if (isLoading) return <Loader label="Loading favourites…" />;

  if (!data?.length) {
    return <EmptyState title="No favourites yet" description="Tap the heart icon on any hotel to save it here." />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {data.map((hotel) => (
        <div key={hotel._id} className="card overflow-hidden">
          <img src={hotel.images?.[0]} alt={hotel.name} className="h-40 w-full object-cover" loading="lazy" />
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link to={`/hotels/${hotel.slug}`} className="font-heading font-semibold text-text hover:text-primary">
                  {hotel.name}
                </Link>
                <p className="mt-1 flex items-center gap-1 text-sm text-text-muted">
                  <MapPin className="h-3.5 w-3.5" /> {hotel.area}
                </p>
              </div>
              <button onClick={() => handleRemove(hotel._id)} aria-label="Remove from favourites">
                <Heart className="h-5 w-5 fill-danger text-danger" />
              </button>
            </div>
            <div className="mt-2">
              <Rating value={hotel.rating || 0} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Favourites;
