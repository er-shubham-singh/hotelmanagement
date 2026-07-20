const OPEN_ROLES = [
  { title: "Frontend Engineer", location: "Bangalore / Remote", type: "Full-time" },
  { title: "Hotel Partnerships Manager", location: "Mumbai", type: "Full-time" },
  { title: "Customer Support Associate", location: "Remote", type: "Full-time" },
];

const Careers = () => (
  <div className="container-app py-14">
    <div className="mb-10 text-center">
      <h1 className="font-heading text-3xl font-bold text-text">Careers at StayByHour</h1>
      <p className="mt-2 text-text-muted">We're building the easiest way to book a room for a few hours — join us.</p>
    </div>

    <div className="mx-auto max-w-2xl space-y-4">
      {OPEN_ROLES.map((role) => (
        <div key={role.title} className="card flex items-center justify-between p-5">
          <div>
            <p className="font-heading font-semibold text-text">{role.title}</p>
            <p className="text-sm text-text-muted">{role.location} · {role.type}</p>
          </div>
          <a href="mailto:careers@staybyhour.com" className="btn-outline text-sm">
            Apply
          </a>
        </div>
      ))}
    </div>
  </div>
);

export default Careers;
