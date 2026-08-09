import SearchWidget from "../components/SearchWidget.jsx";
import CityChips from "../components/CityChips.jsx";
import HeroCarousel from "../components/HeroCarousel.jsx";
import PromoBanners from "../components/PromoBanners.jsx";
import PopularDestinations from "../components/PopularDestinations.jsx";
import AppDownloadSection from "../components/AppDownloadSection.jsx";
import BenefitsGrid from "../components/BenefitsGrid.jsx";
import StatsCounter from "../components/StatsCounter.jsx";
import TestimonialCarousel from "../components/TestimonialCarousel.jsx";
import PressStrip from "../components/PressStrip.jsx";
import FAQAccordion from "../components/FAQAccordion.jsx";
import { CITY_CHIPS } from "../utils/constants.js";
import { Link } from "react-router-dom";

const Section = ({ title, subtitle, children, className = "" }) => (
  <section className={`container-app py-5 sm:py-8 ${className}`}>
    {title && (
      <div className="mb-4 text-center sm:mb-6">
        <h2 className="font-heading text-2xl font-bold text-text sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 text-text-muted">{subtitle}</p>}
      </div>
    )}
    {children}
  </section>
);

const Home = () => (
  <div>
    <HeroCarousel>
      <SearchWidget />
      <div className="mt-6">
        <CityChips />
      </div>
    </HeroCarousel>

    <Section>
      <PromoBanners />
    </Section>

    <Section title="Popular Destinations" subtitle="Hourly and full-day stays in India's busiest cities">
      <PopularDestinations />
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
