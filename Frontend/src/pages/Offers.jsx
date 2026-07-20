import { useQuery } from "@tanstack/react-query";
import { Copy, Tag } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "../common/Loader.jsx";
import EmptyState from "../common/EmptyState.jsx";
import { getOffers } from "../api/offer.api.js";
import { formatDate } from "../utils/formatters.js";

const Offers = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["offers"],
    queryFn: async () => (await getOffers()).data.data.offers,
  });

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied "${code}" to clipboard`);
  };

  if (isLoading) return <Loader fullscreen label="Loading offers…" />;

  return (
    <div className="container-app py-10">
      <h1 className="font-heading text-2xl font-bold text-text sm:text-3xl">Offers & Coupons</h1>
      <p className="mt-1 text-text-muted">Apply these codes at checkout to save on your next hourly stay.</p>

      {!data?.length ? (
        <div className="mt-8">
          <EmptyState title="No active offers right now" description="Check back soon for new deals." />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((offer) => (
            <div key={offer._id} className="card flex flex-col p-5">
              <div className="flex items-center gap-2 text-primary">
                <Tag className="h-4 w-4" />
                <span className="font-mono text-sm font-semibold">{offer.code}</span>
              </div>
              <h3 className="mt-2 font-heading text-base font-semibold text-text">{offer.title}</h3>
              <p className="mt-1 flex-1 text-sm text-text-muted">{offer.description}</p>
              <p className="mt-3 text-xs text-text-muted">Valid till {formatDate(offer.validTo)}</p>
              <button
                onClick={() => copyCode(offer.code)}
                className="btn-outline mt-4 w-full text-sm"
              >
                <Copy className="h-3.5 w-3.5" /> Copy Code
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Offers;
