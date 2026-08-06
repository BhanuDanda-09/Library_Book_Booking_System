import { useEffect } from "react";
import { useLibrary } from "../context/LibraryContext";
import EmptyState from "../components/ui/EmptyState";
import "./Notifications.css";

const TYPE_ICON = { success: "✅", warning: "⚠️", error: "❌", info: "ℹ️" };

export default function Notifications() {
  const { notifications, unreadCount, fetchNotifications, markNotificationRead, markAllNotificationsRead } = useLibrary();

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  return (
    <div className="notif-page page-wrapper animate-fadeInUp">
      <div className="notif-header">
        <div>
          <h1 className="notif-title">🔔 Notifications</h1>
          <p className="notif-sub">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}</p>
        </div>
        {unreadCount > 0 && (
          <button className="notif-read-all-btn" onClick={markAllNotificationsRead}>
            ✓ Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications yet" description="You'll see book updates, due date reminders, and more here." />
      ) : (
        <div className="notif-list">
          {notifications.map(n => (
            <div
              key={n._id}
              className={`notif-item notif-${n.type || "info"} ${!n.isRead ? "unread" : ""}`}
              onClick={() => !n.isRead && markNotificationRead(n._id)}
            >
              <div className="notif-icon">{TYPE_ICON[n.type] || "🔔"}</div>
              <div className="notif-body">
                <div className="notif-item-title">{n.title}</div>
                <div className="notif-item-msg">{n.message}</div>
                <div className="notif-time">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              {!n.isRead && <div className="notif-dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
