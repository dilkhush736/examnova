import { useEffect, useState } from "react";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { fetchAdminListings, updateAdminListingStatus } from "../../services/api/index.js";

export function AdminListingsPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    let active = true;
    async function loadListings() {
      setIsLoading(true);
      try {
        const response = await fetchAdminListings(accessToken);
        if (active) {
          setItems(response.data.items);
        }
      } catch (error) {
        if (active) {
          setFeedback({ type: "error", message: error.message || "Unable to load listings." });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    if (accessToken) {
      loadListings();
    }
    return () => {
      active = false;
    };
  }, [accessToken]);

  async function handleAction(listingId, action) {
    try {
      const response = await updateAdminListingStatus(accessToken, listingId, { action });
      setItems((current) => current.map((item) => (item.id === listingId ? response.data.listing : item)));
      setFeedback({ type: "success", message: `Listing ${action} action completed successfully.` });
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to update listing status." });
    }
  }

  if (isLoading) {
    return <LoadingCard message="Loading admin listings..." />;
  }

  return (
    <section className="stack-section">
      <SectionHeader
        eyebrow="Admin listings"
        title="Marketplace oversight"
        description="Inspect ownership, publication state, and quickly unlist or republish public PDFs when the marketplace needs intervention."
      />
      {feedback.message ? (
        <p className={feedback.type === "error" ? "form-error" : "form-success"}>{feedback.message}</p>
      ) : null}
      <div className="activity-list">
        {items.map((item) => (
          <article className="activity-item" key={item.id}>
            <strong>{item.title}</strong>
            <span className="support-copy">
              {item.sellerName} - {item.taxonomy?.subject} - Rs. {item.priceInr}
            </span>
            <div className="topbar-chip-group">
              <StatusBadge tone={item.isPublished ? "success" : "warning"}>{item.visibility}</StatusBadge>
              <StatusBadge tone={item.moderationStatus === "restricted" ? "danger" : "success"}>
                {item.moderationStatus}
              </StatusBadge>
            </div>
            <div className="hero-actions">
              {item.isPublished ? (
                <button className="button ghost danger" onClick={() => handleAction(item.id, "unlist")} type="button">
                  Unlist
                </button>
              ) : (
                <button className="button secondary" onClick={() => handleAction(item.id, "publish")} type="button">
                  Publish
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
