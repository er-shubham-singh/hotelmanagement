import { useQuery } from "@tanstack/react-query";
import { Copy, Tag, Ticket } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "../common/Loader.jsx";
import EmptyState from "../common/EmptyState.jsx";
import { getOffers } from "../api/offer.api.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";

const STRIPES = ["bg-primary", "bg-secondary", "bg-accent"];

const offerValueLabel = (offer) => (offer.type === "percent" ? `${offer.value}% OFF` : `${formatCurrency(offer.value)} OFF`);

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
    <div>
      <section className="relative overflow-hidden py-10 sm:py-14">
        <img
          src="https://picsum.photos/seed/staybyhour-offers-banner/1600/500"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-hover/80 via-primary-hover/60 to-bg backdrop-blur-sm" />
        <div className="container-app relative">
          <div className="mx-auto max-w-2xl rounded-2xl bg-primary-hover/25 px-5 py-5 text-center backdrop-blur-md sm:px-8 sm:py-6">
            <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">Offers & Coupons</h1>
            <p className="mt-2 text-white/90">Apply these codes at checkout to save on your next hourly stay.</p>
          </div>
        </div>
      </section>

      <div className="container-app py-6 sm:py-10">
        {!data?.length ? (
          <EmptyState
            icon={Ticket}
            title="No active offers right now"
            description="Check back soon for new deals."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((offer, i) => (
              <div key={offer._id} className="card overflow-hidden">
                <div className={`flex items-center justify-between px-5 py-3 text-white ${STRIPES[i % STRIPES.length]}`}>
                  <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide opacity-90">
                    <Tag className="h-3.5 w-3.5" /> Limited-time deal
                  </span>
                  <span className="font-heading text-sm font-bold">{offerValueLabel(offer)}</span>
                </div>

                <div className="relative p-5">
                  <div
                    className="absolute -left-2.5 top-0 h-5 w-5 rounded-full bg-bg"
                    style={{ boxShadow: "0 0 0 2px var(--color-border) inset" }}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute -right-2.5 top-0 h-5 w-5 rounded-full bg-bg"
                    style={{ boxShadow: "0 0 0 2px var(--color-border) inset" }}
                    aria-hidden="true"
                  />
                  <div className="border-t border-dashed border-border pt-4">
                    <h3 className="font-heading text-base font-semibold text-text">{offer.title}</h3>
                    <p className="mt-1 text-sm text-text-muted">{offer.description}</p>
                    <p className="mt-3 text-xs text-text-muted">Valid till {formatDate(offer.validTo)}</p>

                    <button
                      onClick={() => copyCode(offer.code)}
                      className="btn-outline mt-4 flex w-full items-center justify-between text-sm"
                    >
                      <span className="font-mono font-semibold tracking-wide">{offer.code}</span>
                      <span className="flex items-center gap-1.5 text-text-muted">
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;
