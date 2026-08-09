import { useEffect, useState } from "react";

const SLIDE_DURATION_MS = 5500;

const SLIDES = [
  {
    image: "https://picsum.photos/seed/natasha-hero-1/1920/1080",
    heading: "Hotel rooms by the hour, day, or night",
    text: "Flexible check-in times and transparent pricing — book exactly the stay you need, wherever you land.",
  },
  {
    image: "https://picsum.photos/seed/natasha-hero-2/1920/1080",
    heading: "Couple-friendly stays, no awkward questions",
    text: "Verified hotels that welcome unmarried couples with valid ID, clearly tagged so you always know before you book.",
  },
  {
    image: "https://picsum.photos/seed/natasha-hero-3/1920/1080",
    heading: "From a quick layover to a full day",
    text: "3, 6, or 12-hour slots, or a full-day stay — pay only for the time you actually use.",
  },
  {
    image: "https://picsum.photos/seed/natasha-hero-4/1920/1080",
    heading: "Budget rooms to premium suites",
    text: "Every price point, across 8+ major cities and growing — book confidently with instant confirmation.",
  },
  {
    image: "https://picsum.photos/seed/natasha-hero-5/1920/1080",
    heading: "Wallet cashback on every stay",
    text: "Earn Natasha Hotels wallet credit on completed bookings and redeem it on your next trip.",
  },
  {
    image: "https://picsum.photos/seed/natasha-hero-6/1920/1080",
    heading: "Business trips, made simple",
    text: "Tagged business-friendly hotels near tech parks and business districts for quick, no-fuss meeting stays.",
  },
];

// Full-bleed auto-advancing hero: each slide's heading/paragraph animate in
// (heading first, paragraph on a slight delay), and the progress dots at the
// bottom fill left-to-right over the slide's dwell time — once a dot finishes
// filling, the next slide takes over. `children` (the search widget + city
// chips) render once, on top of whichever slide is active.
const HeroCarousel = ({ children }) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return undefined;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), SLIDE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [index, isPaused]);

  const slide = SLIDES[index];

  return (
    <section
      className="relative overflow-hidden py-10 sm:py-14"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {SLIDES.map((s, i) => (
        <img
          key={s.image}
          src={s.image}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-hover/80 via-primary-hover/60 to-bg backdrop-blur-sm" />

      <div className="container-app relative">
        <div key={index} className="mx-auto mb-6 max-w-2xl text-center">
          <div className="rounded-2xl bg-primary-hover/25 px-5 py-5 backdrop-blur-md sm:px-8 sm:py-6">
            <h1 className="animate-fade-slide-up font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {slide.heading}
            </h1>
            <p
              className="animate-fade-slide-up mx-auto mt-4 max-w-2xl text-white/90"
              style={{ animationDelay: "280ms" }}
            >
              {slide.text}
            </p>
          </div>
        </div>

        {children}

        <div className="mt-6 flex items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="relative h-1.5 w-8 overflow-hidden rounded-full bg-white/30"
            >
              <span
                className={`absolute inset-0 rounded-full bg-accent ${
                  i < index ? "" : i > index ? "scale-x-0" : "animate-dot-fill"
                }`}
                style={
                  i === index
                    ? { animationDuration: `${SLIDE_DURATION_MS}ms`, animationPlayState: isPaused ? "paused" : "running" }
                    : i < index
                      ? { transform: "scaleX(1)", transformOrigin: "left" }
                      : { transformOrigin: "left" }
                }
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
