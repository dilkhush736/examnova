import { useEffect, useState } from "react";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
  fetchAdminAlerts,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../services/api/index.js";

export function AdminNotificationsPage() {
  const { accessToken } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [alerts, setAlerts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    let active = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [notificationsResponse, alertsResponse] = await Promise.all([
          fetchNotifications(accessToken),
          fetchAdminAlerts(accessToken),
        ]);
        if (active) {
          setNotifications(notificationsResponse.data.items);
          setAlerts(alertsResponse.data);
        }
      } catch (error) {
        if (active) {
          setFeedback({ type: "error", message: error.message || "Unable to load notifications." });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    if (accessToken) {
      loadData();
    }
    return () => {
      active = false;
    };
  }, [accessToken]);

  async function handleRead(notificationId) {
    await markNotificationRead(accessToken, notificationId);
    setNotifications((current) => current.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)));
  }

  async function handleReadAll() {
    const response = await markAllNotificationsRead(accessToken);
    setNotifications(response.data.items);
  }

  if (isLoading) {
    return <LoadingCard message="Loading admin notifications..." />;
  }

  return (
    <section className="stack-section">
      <SectionHeader
        eyebrow="Alerts and notifications"
        title="Operational signals"
        description="Watch the system pulse with admin alerts, finance triggers, moderation signals, and event-level notifications."
        action={<button className="button ghost" onClick={handleReadAll} type="button">Mark all read</button>}
      />
      {feedback.message ? (
        <p className={feedback.type === "error" ? "form-error" : "form-success"}>{feedback.message}</p>
      ) : null}
      <div className="two-column-grid admin-grid">
        <article className="detail-card">
          <SectionHeader eyebrow="Admin notifications" title="Your in-app alert stream" />
          <div className="activity-list">
            {notifications.length ? notifications.map((item) => (
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
            )) : <p className="support-copy">No admin notifications yet.</p>}
          </div>
        </article>
        <article className="detail-card">
          <SectionHeader eyebrow="Live alert buckets" title="Operational alert groups" />
          <div className="activity-list">
            <article className="activity-item"><strong>Pending withdrawals</strong><span className="support-copy">{alerts?.summary?.pendingWithdrawalAlerts || 0} requests need review.</span></article>
            <article className="activity-item"><strong>Failed payment clusters</strong><span className="support-copy">{alerts?.summary?.repeatedFailedPaymentAlerts || 0} risk groups detected.</span></article>
            <article className="activity-item"><strong>Risky users</strong><span className="support-copy">{alerts?.summary?.riskyUserAlerts || 0} user accounts need attention.</span></article>
            <article className="activity-item"><strong>Flagged listings</strong><span className="support-copy">{alerts?.summary?.flaggedListingAlerts || 0} listings are suspicious or restricted.</span></article>
            <article className="activity-item"><strong>Overdue upcoming releases</strong><span className="support-copy">{alerts?.summary?.overdueUpcomingAlerts || 0} upcoming PDFs missed their target date.</span></article>
          </div>
        </article>
      </div>
    </section>
  );
}
