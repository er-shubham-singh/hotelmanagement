import { Smartphone } from "lucide-react";

const AppDownloadSection = () => (
  <div className="grid items-center gap-8 rounded-2xl bg-primary p-8 text-white sm:grid-cols-2 sm:p-12">
    <div>
      <h3 className="font-heading text-2xl font-bold sm:text-3xl">Book faster with the StayByHour app</h3>
      <p className="mt-3 text-white/85">
        Get exclusive app-only offers, manage bookings on the go, and check in with a tap. Available soon on
        iOS and Android.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-primary">Get it on Google Play</button>
        <button className="rounded-xl border border-white/40 px-4 py-2.5 text-sm font-medium text-white">Download on the App Store</button>
      </div>
    </div>
    <div className="flex justify-center">
      <div className="flex h-48 w-40 items-center justify-center rounded-3xl bg-white/10">
        <Smartphone className="h-16 w-16 text-white/70" />
      </div>
    </div>
  </div>
);

export default AppDownloadSection;
