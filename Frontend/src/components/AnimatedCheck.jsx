// Self-drawn animated success tick (SVG stroke-dashoffset) — no external
// Lottie asset required.
const AnimatedCheck = ({ size = 72 }) => (
  <svg width={size} height={size} viewBox="0 0 72 72" fill="none">
    <circle
      cx="36"
      cy="36"
      r="32"
      stroke="var(--color-success)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeDasharray="201"
      strokeDashoffset="201"
      style={{ animation: "check-circle 0.5s ease-out forwards" }}
    />
    <path
      d="M22 37 L32 47 L50 27"
      stroke="var(--color-success)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      strokeDasharray="40"
      strokeDashoffset="40"
      style={{ animation: "check-mark 0.35s ease-out 0.45s forwards" }}
    />
    <style>{`
      @keyframes check-circle { to { stroke-dashoffset: 0; } }
      @keyframes check-mark { to { stroke-dashoffset: 0; } }
    `}</style>
  </svg>
);

export default AnimatedCheck;
