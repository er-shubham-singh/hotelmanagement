const UNIT_MS = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

// Parses simple durations like "15m", "7d", "1h" into milliseconds.
export const parseDuration = (value, fallbackMs = 0) => {
  const match = /^(\d+)([smhd])$/.exec(String(value).trim());
  if (!match) return fallbackMs;
  const [, amount, unit] = match;
  return Number(amount) * UNIT_MS[unit];
};

export default parseDuration;
