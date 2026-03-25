import { useEffect, useState } from "react";
import { EmptyStateCard } from "../../components/ui/EmptyStateCard.jsx";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../services/api/index.js";

export function NotificationsPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadNotifications() {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetchNotifications(accessToken);
        if (active) {
          setItems(response.data.items);
          setUnreadCount(response.data.unreadCount || 0);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || "Unable to load notifications.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    if (accessToken) {
      loadNotifications();
    }
    return () => {
      active = false;
    };
  }, [accessToken]);

  async function handleRead(notificationId) {
    await markNotificationRead(accessToken, notificationId);
    setItems((current) => current.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)));
    setUnreadCount((current) => Math.max(current - 1, 0));
  }

  async function handleReadAll() {
    const response = await markAllNotificationsRead(accessToken);
    setItems(response.data.items);
    setUnreadCount(response.data.unreadCount || 0);
  }

  if (isLoading) {
    return <LoadingCard message="Loading notifications..." />;
  }

  return (
    <section className="stack-section">
      <SectionHeader
        eyebrow="Notifications"
        title="Notifications"
        description="See account updates, approvals, releases, and transaction-related alerts in one place."
        action={<button className="button ghost" onClick={handleReadAll} type="button">Mark all read</button>}
      />
      {error ? <p className="form-error">{error}</p> : null}
      <p className="support-copy">{unreadCount} unread notifications</p>
      {items.length ? (
        <div className="activity-list">
          {items.map((item) => (
            <article className="activity-item" key={item.id}>
              <strong>{item.title}</strong>
              <span className="support-copy">{item.message}</span>
              <div className="topbar-chip-group">
                <StatusBadge tone={item.isRead ? "neutral" : "warning"}>{item.isRead ? "read" : "unread"}</StatusBadge>
                <StatusBadge tone="neutral">{item.type}</StatusBadge>
              </div>
              {!item.isRead ? (
                <div className="hero-actions">
                  <button className="button secondary" onClick={() => handleRead(item.id)} type="button">
                    Mark read
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <EmptyStateCard
          title="No notifications yet"
          description="Important payment, listing, and withdrawal events will appear here."
        />
      )}
    </section>
  );
}
