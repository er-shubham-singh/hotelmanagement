import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Building2, MapPin, Tag, CalendarCheck, Users, Inbox, Clock, History, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/hotels", label: "Hotels", icon: Building2 },
  { to: "/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/cities", label: "Cities", icon: MapPin, adminOnly: true },
  { to: "/offers", label: "Offers", icon: Tag, adminOnly: true },
  { to: "/leads", label: "Partner Leads", icon: Inbox, adminOnly: true },
  { to: "/users", label: "Users", icon: Users, adminOnly: true },
  { to: "/audit-log", label: "Audit Log", icon: History, adminOnly: true },
];

// Static sidebar on desktop (md+); an off-canvas left-slide drawer on mobile,
// toggled from Topbar's hamburger button.
const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { user } = useAuth();
  const location = useLocation();
  const visibleLinks = links.filter((l) => !l.adminOnly || user?.role === "admin");

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation"
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-shrink-0 flex-col border-r border-border bg-surface transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-5 font-heading text-lg font-bold text-text">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <Clock className="h-5 w-5" />
            </span>
            StayByHour
            <span className="badge">Admin</span>
          </div>
          <button onClick={onClose} aria-label="Close menu" className="rounded-lg p-1.5 text-text-muted hover:bg-surface-muted md:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                  isActive ? "bg-primary text-white" : "text-text-muted hover:bg-surface-muted"
                }`
              }
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
