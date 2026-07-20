import { useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { X, Moon, Sun, User, LogOut, Clock } from "lucide-react";
import { CITY_CHIPS } from "../utils/constants.js";

// Full-height left-to-right slide-in drawer for mobile nav. Always mounted
// (visibility driven by transform/opacity classes, not conditional render)
// so its effects can react to route changes even while closed.
const MobileDrawer = ({ isOpen, onClose, navLinks, isAuthenticated, user, theme, toggleTheme, onLogout }) => {
  const drawerRef = useRef(null);
  const location = useLocation();

  // Close on route change.
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Scroll-lock + Esc-to-close + focus-trap while open.
  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const getFocusable = () =>
      drawerRef.current?.querySelectorAll('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])') || [];

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const focusable = getFocusable();
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    getFocusable()[0]?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  const linkClass = ({ isActive }) =>
    `block rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? "bg-primary-light/40 text-primary" : "text-text hover:bg-surface-muted"}`;

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[85%] max-w-xs flex-col bg-surface shadow-soft-lg transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <Link to="/" className="flex items-center gap-2 font-heading text-lg font-bold text-text" onClick={onClose}>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
              <Clock className="h-4 w-4" />
            </span>
            StayByHour
          </Link>
          <button onClick={onClose} aria-label="Close menu" className="rounded-lg p-2 text-text-muted hover:bg-surface-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isAuthenticated && (
            <Link to="/dashboard/profile" className="mb-4 flex items-center gap-3 rounded-xl bg-surface-muted p-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white">
                <User className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text">{user?.name}</p>
                <p className="text-xs text-text-muted">View profile</p>
              </div>
            </Link>
          )}

          <nav className="space-y-1">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <>
                <NavLink to="/dashboard/bookings" className={linkClass}>
                  My Bookings
                </NavLink>
                <NavLink to="/dashboard/wallet" className={linkClass}>
                  Wallet
                </NavLink>
                <NavLink to="/dashboard/favourites" className={linkClass}>
                  Favourites
                </NavLink>
              </>
            )}
          </nav>

          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Popular Cities</p>
            <div className="flex flex-wrap gap-2 px-3">
              {CITY_CHIPS.slice(0, 6).map((city) => (
                <Link
                  key={city}
                  to={`/hotels-in-${city.toLowerCase()}`}
                  className="rounded-full border border-border px-3 py-1 text-xs text-text-muted hover:border-primary hover:text-primary"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="mt-5 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-text hover:bg-surface-muted"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <div className="mt-auto flex-shrink-0 border-t border-border p-5">
          {isAuthenticated ? (
            <button
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger/30 px-4 py-2.5 text-sm font-medium text-danger hover:bg-danger/10"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          ) : (
            <Link to="/login" onClick={onClose} className="btn-primary w-full">
              Login / Sign up
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;
