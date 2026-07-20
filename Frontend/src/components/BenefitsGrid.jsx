import { Clock3, MapPinned, Wallet2, HeartHandshake } from "lucide-react";

const benefits = [
  { icon: Clock3, title: "Anytime Check-in", desc: "Book a slot at any hour of the day — no fixed check-in time." },
  { icon: MapPinned, title: "Pan-India Coverage", desc: "Hourly stays available across 8+ major cities and growing." },
  { icon: Wallet2, title: "Budget to Luxury", desc: "From simple day-use rooms to premium suites, at every price point." },
  { icon: HeartHandshake, title: "Couple Friendly", desc: "Verified couple-friendly hotels with local ID acceptance." },
];

const BenefitsGrid = () => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
    {benefits.map((b) => (
      <div key={b.title} className="card p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary">
          <b.icon className="h-6 w-6" />
        </div>
        <h3 className="font-heading text-base font-semibold text-text">{b.title}</h3>
        <p className="mt-1.5 text-sm text-text-muted">{b.desc}</p>
      </div>
    ))}
  </div>
);

export default BenefitsGrid;
