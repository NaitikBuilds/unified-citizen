import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { notificationApi } from "../../lib/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import type { Notification } from "../../types";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await notificationApi.list(1, 50);
      setNotifications(data.notifications);
    } catch {
      /* */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    await notificationApi.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    await Promise.all(unread.map((n) => notificationApi.markRead(n.id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unread = notifications.filter((n) => !n.isRead);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unread.length > 0 && (
          <button
            className="btn btn-ghost btn-sm gap-2"
            onClick={handleMarkAllRead}
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-16 w-16" />}
          title="No notifications"
          description="You'll see updates about your grievances here."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`card bg-base-100 shadow-sm border border-base-300 cursor-pointer hover:shadow-md transition ${
                !n.isRead ? "border-l-4 border-l-primary" : ""
              }`}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
            >
              <div className="card-body p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3
                      className={`text-sm ${!n.isRead ? "font-semibold" : "font-medium"}`}
                    >
                      {n.title}
                    </h3>
                    <p className="text-sm text-base-content/60 mt-1">
                      {n.message}
                    </p>
                  </div>
                  <span className="text-xs text-base-content/40 whitespace-nowrap ml-4">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {!n.isRead && (
                  <div className="badge badge-primary badge-xs mt-2">New</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
