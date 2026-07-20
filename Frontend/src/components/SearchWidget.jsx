import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Clock } from "lucide-react";
import Select from "../common/Select.jsx";
import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";
import { useCities } from "../hooks/useHotels.js";
import { CITY_CHIPS, DURATION_OPTIONS, STAY_TYPES, FULL_DAY_DURATION } from "../utils/constants.js";
import { getDefaultCheckInTime } from "../utils/formatters.js";

const todayStr = () => new Date().toISOString().split("T")[0];

const SearchWidget = ({ compact = false }) => {
  const navigate = useNavigate();
  const { data: cities } = useCities();
  const [stayType, setStayType] = useState(STAY_TYPES.HOURLY);
  const [city, setCity] = useState("");
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState(getDefaultCheckInTime());
  const [duration, setDuration] = useState(6);

  const handleSubmit = (e) => {
    e.preventDefault();
    const chosenCity = city || CITY_CHIPS[0];
    const params = new URLSearchParams({
      checkIn: date,
      time,
      duration: stayType === STAY_TYPES.FULL_DAY ? FULL_DAY_DURATION : duration,
    });
    navigate(`/hotels-in-${chosenCity.toLowerCase()}?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full rounded-2xl border border-border bg-surface p-4 shadow-soft-lg sm:p-6 ${compact ? "" : ""}`}
    >
      <div className="mb-4 inline-flex rounded-xl bg-surface-muted p-1">
        {[
          { value: STAY_TYPES.HOURLY, label: "Hourly Stay" },
          { value: STAY_TYPES.FULL_DAY, label: "Full-Day Stay" },
        ].map((opt) => (
          <button
            type="button"
            key={opt.value}
            onClick={() => setStayType(opt.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              stayType === opt.value ? "bg-primary text-white" : "text-text-muted hover:text-text"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <div className="lg:col-span-2">
          <label className="label flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> City
          </label>
          <Select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">Select a city</option>
            {(cities || CITY_CHIPS.map((name) => ({ name }))).map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <Input
          type="date"
          label={
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Date
            </span>
          }
          min={todayStr()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <Input
          type="time"
          label={
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Check-in Time
            </span>
          }
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        {stayType === STAY_TYPES.HOURLY ? (
          <Select label="Duration" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
            {DURATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        ) : (
          <div className="flex items-end">
            <Button type="submit" className="w-full lg:hidden">
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>
        )}
      </div>

      <Button type="submit" className="mt-4 hidden w-full lg:flex" variant="accent">
        <Search className="h-4 w-4" /> Search Hotels
      </Button>
      {stayType === STAY_TYPES.HOURLY && (
        <Button type="submit" className="mt-4 flex w-full lg:hidden" variant="accent">
          <Search className="h-4 w-4" /> Search Hotels
        </Button>
      )}
    </form>
  );
};

export default SearchWidget;
