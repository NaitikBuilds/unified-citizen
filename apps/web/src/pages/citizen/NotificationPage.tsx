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
    try { const { data } = await notificationApi.list(1, 50); setNotifications(data.notifications); } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    await notificationApi.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
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
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        {unread.length > 0 && (
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:text-white transition" style={{ border: "1px solid rgba(255,255,255,0.1)" }} onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={<Bell className="h-16 w-16" />} title="No notifications" description="You'll see updates about your grievances here." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-2xl p-4 cursor-pointer transition hover:bg-white/5 ${!n.isRead ? "border-l-4 border-l-white" : ""}`}
              style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`text-sm ${!n.isRead ? "font-semibold text-white" : "font-medium text-gray-300"}`}>{n.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                </div>
                <span className="text-xs text-gray-600 whitespace-nowrap ml-4">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
              {!n.isRead && <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-black">New</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
