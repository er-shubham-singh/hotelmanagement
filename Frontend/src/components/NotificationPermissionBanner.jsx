import { useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { isFirebasePushReady } from "../config/env.js";
import { initPushNotifications } from "../firebase/firebaseClient.js";

const DISMISS_KEY = "sbh_push_prompt_dismissed";

// A quiet, dismissible banner instead of firing the browser permission
// prompt on every login — only shows once per user until they act on it or
// dismiss it (persisted in localStorage), and never if permission is already
// granted/denied or Firebase push isn't configured on this deployment.
const NotificationPermissionBanner = () => {
  const { isAuthenticated } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isFirebasePushReady) return;
    if (typeof Notification === "undefined" || Notification.permission !== "default") return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    setVisible(true);
  }, [isAuthenticated]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const enable = async () => {
    await initPushNotifications().catch(() => null);
    dismiss();
  };

  if (!visible) return null;

  return (
    <div className="border-b border-border bg-primary/5">
      <div className="container-app flex flex-col items-center justify-between gap-2 py-2.5 text-sm sm:flex-row">
        <div className="flex items-center gap-2 text-text">
          <BellRing className="h-4 w-4 shrink-0 text-primary" />
          <span>Enable reminders to get check-in/checkout alerts and overdue-fine warnings instantly.</span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button onClick={enable} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover">
            Enable reminders
          </button>
          <button onClick={dismiss} aria-label="Dismiss" className="rounded-lg p-1.5 text-text-muted hover:bg-surface-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionBanner;
