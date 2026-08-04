const banners = [
  {
    title: "First Booking? Save ₹100",
    subtitle: "Use code FIRST100 on your first hourly stay",
    image: "https://picsum.photos/seed/staybyhour-promo-1/600/400",
    overlay: "from-primary-hover/95 via-primary-hover/80 to-primary-hover/40",
  },
  {
    title: "Weekend Getaways, 20% Off",
    subtitle: "Use code WEEKEND20, up to ₹300 off",
    image: "https://picsum.photos/seed/staybyhour-promo-2/600/400",
    overlay: "from-accent-hover/95 via-accent-hover/75 to-accent-hover/35",
  },
  {
    title: "Couple-Friendly Stays",
    subtitle: "₹250 off with code COUPLE250",
    image: "https://picsum.photos/seed/staybyhour-promo-3/600/400",
    overlay: "from-secondary/95 via-secondary/75 to-secondary/35",
  },
];

const PromoBanners = () => (
  <div className="grid gap-4 sm:grid-cols-3">
    {banners.map((b) => (
      <div key={b.title} className="relative overflow-hidden rounded-2xl shadow-soft">
        <img src={b.image} alt="" aria-hidden="true" loading="lazy" className="h-40 w-full object-cover" />
        <div className={`absolute inset-0 bg-gradient-to-t ${b.overlay}`} />
        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end gap-1 rounded-b-2xl bg-black/15 p-4 backdrop-blur-sm">
          <p className="font-heading text-lg font-semibold text-white">{b.title}</p>
          <p className="text-sm text-white/90">{b.subtitle}</p>
        </div>
      </div>
    ))}
  </div>
);

export default PromoBanners;
