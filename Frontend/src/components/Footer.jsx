import { Link } from "react-router-dom";
import { Clock, Facebook, Instagram, Twitter } from "lucide-react";
import { CITY_CHIPS } from "../utils/constants.js";
import { env } from "../config/env.js";

const columns = [
  {
    title: "Company",
    links: [
      { to: "/about", label: "About Us" },
      { to: "/contact", label: "Contact" },
      { to: "/careers", label: "Careers" },
      { to: "/partner", label: "List Your Hotel" },
    ],
  },
  {
    title: "Support",
    links: [
      { to: "/faqs", label: "FAQs" },
      { to: "/terms", label: "Terms & Conditions" },
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/offers", label: "Offers" },
    ],
  },
];

const Footer = () => (
  <footer className="mt-20 border-t border-border bg-surface">
    <div className="container-app grid gap-10 py-14 md:grid-cols-[2fr_1fr_1fr_1.5fr]">
      <div>
        <Link to="/" className="mb-4 flex items-center gap-2 font-heading text-xl font-bold text-text">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
            <Clock className="h-5 w-5" />
          </span>
          {env.appName}
        </Link>
        <p className="max-w-sm text-sm text-text-muted">
          Flexible hourly and full-day hotel stays across India — transparent pricing, couple-friendly stays,
          and instant confirmation.
        </p>
        <div className="mt-4 flex gap-3 text-text-muted">
          <Facebook className="h-5 w-5 hover:text-primary" />
          <Instagram className="h-5 w-5 hover:text-primary" />
          <Twitter className="h-5 w-5 hover:text-primary" />
        </div>
      </div>

      {columns.map((col) => (
        <div key={col.title}>
          <h4 className="mb-3 font-heading text-sm font-semibold text-text">{col.title}</h4>
          <ul className="space-y-2">
            {col.links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-text-muted hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div>
        <h4 className="mb-3 font-heading text-sm font-semibold text-text">Hourly Hotels By City</h4>
        <ul className="grid grid-cols-2 gap-2">
          {CITY_CHIPS.map((city) => (
            <li key={city}>
              <Link to={`/hotels-in-${city.toLowerCase()}`} className="text-sm text-text-muted hover:text-primary">
                Hotels in {city}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="border-t border-border py-5">
      <p className="container-app text-center text-xs text-text-muted">
        © {new Date().getFullYear()} {env.appName}. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
