import SearchWidget from "../components/SearchWidget.jsx";
import CityChips from "../components/CityChips.jsx";
import PromoBanners from "../components/PromoBanners.jsx";
import AppDownloadSection from "../components/AppDownloadSection.jsx";
import BenefitsGrid from "../components/BenefitsGrid.jsx";
import StatsCounter from "../components/StatsCounter.jsx";
import TestimonialCarousel from "../components/TestimonialCarousel.jsx";
import PressStrip from "../components/PressStrip.jsx";
import FAQAccordion from "../components/FAQAccordion.jsx";
import { CITY_CHIPS } from "../utils/constants.js";
import { Link } from "react-router-dom";

const Section = ({ title, subtitle, children, className = "" }) => (
  <section className={`container-app py-14 ${className}`}>
    {title && (
      <div className="mb-8 text-center">
        <h2 className="font-heading text-2xl font-bold text-text sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 text-text-muted">{subtitle}</p>}
      </div>
    )}
    {children}
  </section>
);

const Home = () => (
  <div>
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-light/60 to-bg py-12 sm:py-16">
      <div className="container-app">
        <div className="mb-10 text-center">
          <h1 className="font-heading text-3xl font-bold text-text sm:text-4xl lg:text-5xl">
            Hotel rooms by the hour, day, or night —{" "}
            <span className="text-primary">wherever you land</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-text-muted">
            Flexible check-in times, transparent pricing, and couple-friendly stays across India. No overnight
            charges for a short stopover.
          </p>
        </div>
        <SearchWidget />
        <div className="mt-8">
          <CityChips />
        </div>
      </div>
    </section>

    <Section>
      <PromoBanners />
    </Section>

    <Section title="Why book with us" subtitle="Built for travelers who need a room, not a whole hotel experience">
      <BenefitsGrid />
    </Section>

    <Section>
      <StatsCounter />
    </Section>

    <Section>
      <AppDownloadSection />
    </Section>

    <Section title="What our guests say">
      <TestimonialCarousel />
    </Section>

    <Section title="As featured in">
      <PressStrip />
    </Section>

    <Section title="Frequently asked questions">
      <FAQAccordion />
    </Section>

    <Section title="Hourly hotels, city by city">
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
        {CITY_CHIPS.map((city) => (
          <Link key={city} to={`/hotels-in-${city.toLowerCase()}`} className="text-sm text-text-muted hover:text-primary">
            Hourly Hotels in {city}
          </Link>
        ))}
      </div>
    </Section>
  </div>
);

export default Home;
