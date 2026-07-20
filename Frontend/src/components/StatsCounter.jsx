import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 1200000, label: "Happy Guests", suffix: "+" },
  { value: 8500, label: "Partner Hotels", suffix: "+" },
  { value: 8, label: "Cities Covered", suffix: "" },
  { value: 4.6, label: "Average Rating", suffix: "★", decimals: 1 },
];

const useCountUp = (target, isVisible, decimals = 0) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isVisible) return undefined;
    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(target * progress);
      if (progress < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isVisible, target]);

  return decimals ? value.toFixed(decimals) : Math.floor(value).toLocaleString("en-IN");
};

const StatItem = ({ stat, isVisible }) => {
  const display = useCountUp(stat.value, isVisible, stat.decimals);
  return (
    <div className="text-center">
      <p className="font-heading text-3xl font-bold text-primary sm:text-4xl">
        {display}
        {stat.suffix}
      </p>
      <p className="mt-1 text-sm text-text-muted">{stat.label}</p>
    </div>
  );
};

const StatsCounter = () => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setIsVisible(true), {
      threshold: 0.3,
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 gap-6 rounded-2xl bg-surface-muted p-8 sm:grid-cols-4">
      {STATS.map((stat) => (
        <StatItem key={stat.label} stat={stat} isVisible={isVisible} />
      ))}
    </div>
  );
};

export default StatsCounter;
