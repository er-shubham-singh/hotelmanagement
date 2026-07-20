export const formatCurrency = (amount) => {
  if (amount == null || Number.isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date, options = { day: "numeric", month: "short", year: "numeric" }) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", options).format(new Date(date));
};

export const formatTime = (time) => {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
};

export const durationLabel = (hrs) => {
  if (hrs === 24) return "Full Day";
  return `${hrs} Hours`;
};

export const slotFieldForDuration = (hrs) =>
  ({ 3: "threeHr", 6: "sixHr", 12: "twelveHr", 24: "fullDay" })[hrs];

// A safe default check-in time — "now" rounded up to the next half hour, plus
// a buffer, so a same-day booking never lands on a time that's already past
// by the time the request reaches the server.
export const getDefaultCheckInTime = () => {
  const d = new Date(Date.now() + 60 * 60 * 1000); // +1 hour buffer
  const minutes = d.getMinutes() <= 30 ? 30 : 0;
  if (minutes === 0) d.setHours(d.getHours() + 1);
  d.setMinutes(minutes, 0, 0);
  return `${String(d.getHours()).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};
