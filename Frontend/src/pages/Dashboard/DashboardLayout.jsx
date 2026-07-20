import { NavLink, Outlet } from "react-router-dom";
import { User, CalendarCheck, Wallet, Heart } from "lucide-react";

const links = [
  { to: "/dashboard/profile", label: "Profile", icon: User },
  { to: "/dashboard/bookings", label: "My Bookings", icon: CalendarCheck },
  { to: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { to: "/dashboard/favourites", label: "Favourites", icon: Heart },
];

const DashboardLayout = () => (
  <div className="container-app py-8">
    <h1 className="mb-6 font-heading text-2xl font-bold text-text">My Account</h1>
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="flex gap-2 overflow-x-auto lg:w-56 lg:flex-shrink-0 lg:flex-col">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium ${
                isActive ? "bg-primary text-white" : "text-text-muted hover:bg-surface-muted"
              }`
            }
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </NavLink>
        ))}
      </aside>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  </div>
);

export default DashboardLayout;
