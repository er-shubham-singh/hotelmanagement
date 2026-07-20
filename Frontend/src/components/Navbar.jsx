import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Moon, Sun, User, Wallet, LogOut, Clock } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { useTheme } from "../hooks/useTheme.js";
import { env } from "../config/env.js";
import NotificationBell from "./NotificationBell.jsx";
import MobileDrawer from "./MobileDrawer.jsx";

const navLinks = [
  { to: "/all-cities", label: "All Cities" },
  { to: "/offers", label: "Offers" },
  { to: "/partner", label: "List Your Hotel" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    setIsOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
      <nav className="container-app flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold text-text">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
            <Clock className="h-5 w-5" />
          </span>
          {env.appName}
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-text-muted"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="rounded-xl p-2 text-text-muted hover:bg-surface-muted"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {isAuthenticated && <NotificationBell />}

          {isAuthenticated ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsProfileOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-sm font-medium hover:bg-surface-muted"
              >
                <User className="h-4 w-4" />
                {user?.name?.split(" ")[0]}
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-surface py-1.5 shadow-soft-lg">
                  <Link to="/dashboard/profile" className="block px-4 py-2 text-sm hover:bg-surface-muted" onClick={() => setIsProfileOpen(false)}>
                    My Profile
                  </Link>
                  <Link to="/dashboard/bookings" className="block px-4 py-2 text-sm hover:bg-surface-muted" onClick={() => setIsProfileOpen(false)}>
                    My Bookings
                  </Link>
                  <Link to="/dashboard/wallet" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface-muted" onClick={() => setIsProfileOpen(false)}>
                    <Wallet className="h-4 w-4" /> Wallet
                  </Link>
                  <Link to="/dashboard/favourites" className="block px-4 py-2 text-sm hover:bg-surface-muted" onClick={() => setIsProfileOpen(false)}>
                    Favourites
                  </Link>
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-danger hover:bg-surface-muted">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary hidden md:inline-flex">
              Login / Sign up
            </Link>
          )}

          <button
            className="rounded-xl p-2 text-text-muted hover:bg-surface-muted md:hidden"
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <MobileDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        navLinks={navLinks}
        isAuthenticated={isAuthenticated}
        user={user}
        theme={theme}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
      />
    </header>
  );
};

export default Navbar;
