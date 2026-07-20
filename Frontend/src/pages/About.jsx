import { Clock3, ShieldCheck, Users2 } from "lucide-react";

const About = () => (
  <div className="container-app py-14">
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="font-heading text-3xl font-bold text-text">About StayByHour</h1>
      <p className="mt-4 text-text-muted">
        StayByHour started with a simple idea: not every trip needs a full night's stay. Whether it's a layover,
        a business meeting, or a few hours to freshen up between trains, we help travelers find a clean,
        comfortable room for exactly the time they need — nothing more, nothing less.
      </p>
      <p className="mt-4 text-text-muted">
        We work with verified hotel partners across India to offer transparent, hourly pricing with instant
        confirmation, so you're never stuck paying for a full night you won't use.
      </p>
    </div>

    <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-3">
      {[
        { icon: Clock3, title: "Flexible by Design", desc: "3, 6, 12-hour or full-day slots at any check-in time." },
        { icon: ShieldCheck, title: "Verified Partners", desc: "Every listed hotel is vetted for cleanliness and safety." },
        { icon: Users2, title: "Guest First", desc: "Transparent pricing and responsive support, always." },
      ].map((item) => (
        <div key={item.title} className="card p-5 text-center">
          <item.icon className="mx-auto h-8 w-8 text-primary" />
          <h3 className="mt-3 font-heading font-semibold text-text">{item.title}</h3>
          <p className="mt-1 text-sm text-text-muted">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

export default About;
