const banners = [
  {
    title: "First Booking? Save ₹100",
    subtitle: "Use code FIRST100 on your first hourly stay",
    className: "bg-primary text-white",
  },
  {
    title: "Weekend Getaways, 20% Off",
    subtitle: "Use code WEEKEND20, up to ₹300 off",
    className: "bg-accent text-white",
  },
  {
    title: "Couple-Friendly Stays",
    subtitle: "₹250 off with code COUPLE250",
    className: "bg-surface-muted text-text",
  },
];

const PromoBanners = () => (
  <div className="grid gap-4 sm:grid-cols-3">
    {banners.map((b) => (
      <div key={b.title} className={`rounded-2xl p-6 shadow-soft ${b.className}`}>
        <p className="font-heading text-lg font-semibold">{b.title}</p>
        <p className="mt-1 text-sm opacity-90">{b.subtitle}</p>
      </div>
    ))}
  </div>
);

export default PromoBanners;
