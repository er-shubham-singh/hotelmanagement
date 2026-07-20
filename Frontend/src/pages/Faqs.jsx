import FAQAccordion from "../components/FAQAccordion.jsx";

const Faqs = () => (
  <div className="container-app py-14">
    <div className="mb-10 text-center">
      <h1 className="font-heading text-3xl font-bold text-text">Frequently Asked Questions</h1>
      <p className="mt-2 text-text-muted">Everything you need to know about booking with StayByHour.</p>
    </div>
    <FAQAccordion />
  </div>
);

export default Faqs;
