import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const TESTIMONIALS = [
  { name: "Ananya R.", city: "Mumbai", text: "Needed a room for a 6-hour layover and the whole process took two minutes. Clean room, easy check-in." },
  { name: "Vikram S.", city: "Bangalore", text: "Great for a quick business meeting spot near the tech park. Booked a 3-hour slot and it worked perfectly." },
  { name: "Priya & Rohan", city: "Delhi", text: "Appreciated that the hotel was upfront about couple-friendly policies. No awkward questions at the desk." },
  { name: "Farhan K.", city: "Pune", text: "Used the wallet cashback from my last booking on this one — small details like that make a difference." },
];

const TestimonialCarousel = () => {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => setIndex((i) => (i + 1) % TESTIMONIALS.length), []);
  const prev = () => setIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const t = TESTIMONIALS[index];

  return (
    <div className="relative mx-auto max-w-2xl rounded-2xl bg-surface-muted p-8 text-center sm:p-10">
      <Quote className="mx-auto mb-4 h-8 w-8 text-primary" />
      <p className="text-lg text-text">"{t.text}"</p>
      <p className="mt-4 font-heading font-semibold text-text">{t.name}</p>
      <p className="text-sm text-text-muted">{t.city}</p>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button onClick={prev} aria-label="Previous testimonial" className="rounded-full border border-border p-2 hover:bg-surface">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-1.5">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to testimonial ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>
        <button onClick={next} aria-label="Next testimonial" className="rounded-full border border-border p-2 hover:bg-surface">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TestimonialCarousel;
