import { Moon, Sun, LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useTheme } from "../hooks/useTheme.js";
import NotificationBell from "./NotificationBell.jsx";

const Topbar = ({ title, onOpenSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button onClick={onOpenSidebar} aria-label="Open menu" className="rounded-xl p-2 text-text-muted hover:bg-surface-muted md:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="truncate font-heading text-lg font-semibold text-text">{title}</h1>
      </div>
      <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-3">
        <button onClick={toggleTheme} aria-label="Toggle dark mode" className="rounded-xl p-2 text-text-muted hover:bg-surface-muted">
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <NotificationBell />
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-text">{user?.name}</p>
          <p className="text-xs capitalize text-text-muted">{user?.role}</p>
        </div>
        <button onClick={handleLogout} aria-label="Logout" className="rounded-xl p-2 text-text-muted hover:bg-surface-muted">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
