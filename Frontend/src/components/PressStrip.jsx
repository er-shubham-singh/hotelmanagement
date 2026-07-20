const PRESS = ["The Daily Ledger", "TravelWire", "Metro Business", "UrbanScoop", "The Commute"];

const PressStrip = () => (
  <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
    {PRESS.map((name) => (
      <span key={name} className="font-heading text-lg font-semibold text-text-muted">
        {name}
      </span>
    ))}
  </div>
);

export default PressStrip;
