import { useEffect, useState } from "react";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
  fetchAdminModerationQueue,
  updateAdminListingStatus,
} from "../../services/api/index.js";

export function AdminModerationPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    let active = true;
    async function loadQueue() {
      setIsLoading(true);
      try {
        const response = await fetchAdminModerationQueue(accessToken, "flaggedOnly=true");
        if (active) {
          setItems(response.data.items);
        }
      } catch (error) {
        if (active) {
          setFeedback({ type: "error", message: error.message || "Unable to load moderation queue." });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    if (accessToken) {
      loadQueue();
    }
    return () => {
      active = false;
    };
  }, [accessToken]);

  async function handleAction(listingId, action) {
    try {
      const response = await updateAdminListingStatus(accessToken, listingId, { action });
      setItems((current) => current.map((item) => (item.id === listingId ? response.data.listing : item)));
      setFeedback({ type: "success", message: `Moderation action ${action} completed successfully.` });
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to update moderation state." });
    }
  }

  if (isLoading) {
    return <LoadingCard message="Loading moderation queue..." />;
  }

  return (
    <section className="stack-section">
      <SectionHeader
        eyebrow="Moderation"
        title="Content review and risk control"
        description="Review suspicious or restricted listings and take explicit publish, unlist, flag, or clear actions."
      />
      {feedback.message ? (
        <p className={feedback.type === "error" ? "form-error" : "form-success"}>{feedback.message}</p>
      ) : null}
      <div className="activity-list">
        {items.length ? items.map((item) => (
          <article className="activity-item" key={item.id}>
            <strong>{item.title}</strong>
            <span className="support-copy">
              {item.sellerName} - {item.taxonomy?.subject} - {item.taxonomy?.semester}
            </span>
            <div className="topbar-chip-group">
              <StatusBadge tone={item.moderationStatus === "suspicious" ? "danger" : "warning"}>
                {item.moderationStatus}
              </StatusBadge>
              <StatusBadge tone={item.isPublished ? "success" : "warning"}>{item.visibility}</StatusBadge>
            </div>
            <div className="hero-actions">
              <button className="button ghost danger" onClick={() => handleAction(item.id, "unlist")} type="button">
                Unlist
              </button>
              <button className="button ghost" onClick={() => handleAction(item.id, "flag_suspicious")} type="button">
                Flag suspicious
              </button>
              <button className="button secondary" onClick={() => handleAction(item.id, "clear_flag")} type="button">
                Clear flag
              </button>
              <button className="button primary" onClick={() => handleAction(item.id, "publish")} type="button">
                Publish
              </button>
            </div>
          </article>
        )) : <p className="support-copy">No flagged listings are waiting for moderation.</p>}
      </div>
    </section>
  );
}
