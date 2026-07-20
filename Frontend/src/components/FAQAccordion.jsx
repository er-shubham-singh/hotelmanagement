import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const DEFAULT_FAQS = [
  {
    q: "How does hourly hotel booking work?",
    a: "Pick a city, date, check-in time, and a duration (3, 6, or 12 hours), or choose a full-day stay. You'll only pay for the slot you book — no overnight charges unless you want them.",
  },
  {
    q: "Do I need to carry ID proof?",
    a: "Yes, a valid government-issued photo ID is required at check-in for all guests. Hotels tagged 'Accepts Local ID' also accept local address proof.",
  },
  {
    q: "Are unmarried couples allowed to book?",
    a: "Hotels tagged 'Couple Friendly' explicitly welcome unmarried couples with valid ID. Please check the hotel's tags before booking.",
  },
  {
    q: "Can I cancel or reschedule my booking?",
    a: "You can cancel a booking from your dashboard before check-in time. Refunds to your wallet or original payment method follow the hotel's cancellation policy.",
  },
  {
    q: "How does the wallet cashback work?",
    a: "Cashback is credited to your StayByHour wallet after a completed stay and can be redeemed against future bookings, partially or in full.",
  },
];

const FAQAccordion = ({ items = DEFAULT_FAQS }) => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-border rounded-2xl border border-border bg-surface">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.q}>
            <button
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
              aria-expanded={isOpen}
            >
              <span className="font-medium text-text">{item.q}</span>
              <ChevronDown className={`h-4 w-4 flex-shrink-0 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && <p className="px-5 pb-4 text-sm text-text-muted">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
};

export default FAQAccordion;
