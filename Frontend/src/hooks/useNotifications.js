import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./useAuth.js";
import { useSocketEvent } from "./useSocket.js";
import { getNotifications, getUnreadCount, markAllNotificationsRead } from "../api/notification.api.js";

export const useNotifications = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([getNotifications(1), getUnreadCount()]);
      setNotifications(listRes.data.data.notifications);
      setUnreadCount(countRes.data.data.count);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) refresh();
    else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, refresh]);

  useSocketEvent(
    "notification:new",
    (payload) => {
      setNotifications((prev) => [payload.notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast(payload.notification.title, { icon: "🔔" });
    },
    []
  );

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, isLoading, refresh, markAllRead };
};

export default useNotifications;
