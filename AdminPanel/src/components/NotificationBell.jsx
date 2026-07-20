import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications.js";

const formatWhen = (date) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(date));

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, isLoading, refresh, markAllRead } = useNotifications();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isOpen]);

  const handleToggle = async () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      await refresh();
      await markAllRead();
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button onClick={handleToggle} aria-label="Notifications" className="relative rounded-xl p-2 text-text-muted hover:bg-surface-muted">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] rounded-xl border border-border bg-surface shadow-soft-lg">
          <div className="border-b border-border px-4 py-3">
            <p className="font-heading text-sm font-semibold text-text">Notifications</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-6 text-center text-sm text-text-muted">Loading…</p>
            ) : !notifications.length ? (
              <p className="px-4 py-6 text-center text-sm text-text-muted">You're all caught up.</p>
            ) : (
              notifications.map((n) => (
                <div key={n._id} className="border-b border-border px-4 py-3 last:border-0">
                  <p className="text-sm font-medium text-text">{n.title}</p>
                  <p className="mt-0.5 text-xs text-text-muted">{n.body}</p>
                  <p className="mt-1 text-[11px] text-text-muted">{formatWhen(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
