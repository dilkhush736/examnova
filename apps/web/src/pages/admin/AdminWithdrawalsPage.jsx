import { useEffect, useState } from "react";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { fetchAdminWithdrawals, updateAdminWithdrawalStatus } from "../../services/api/index.js";

export function AdminWithdrawalsPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    let active = true;
    async function loadWithdrawals() {
      setIsLoading(true);
      try {
        const response = await fetchAdminWithdrawals(accessToken);
        if (active) {
          setItems(response.data.items);
        }
      } catch (error) {
        if (active) {
          setFeedback({ type: "error", message: error.message || "Unable to load withdrawals." });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    if (accessToken) {
      loadWithdrawals();
    }
    return () => {
      active = false;
    };
  }, [accessToken]);

  async function handleAction(withdrawalId, action) {
    try {
      const response = await updateAdminWithdrawalStatus(accessToken, withdrawalId, {
        action,
        adminNote: action === "reject" ? "Rejected from admin console." : "",
      });
      setItems((current) => current.map((item) => (item.id === withdrawalId ? response.data.item : item)));
      setFeedback({ type: "success", message: `Withdrawal ${action} action completed successfully.` });
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to update withdrawal." });
    }
  }

  if (isLoading) {
    return <LoadingCard message="Loading admin withdrawals..." />;
  }

  return (
    <section className="stack-section">
      <SectionHeader
        eyebrow="Admin withdrawals"
        title="Payout review queue"
        description="Approve, reject, or mark payout requests as paid while preserving explicit request lifecycle state."
      />
      {feedback.message ? (
        <p className={feedback.type === "error" ? "form-error" : "form-success"}>{feedback.message}</p>
      ) : null}
      <div className="activity-list">
        {items.map((item) => (
          <article className="activity-item" key={item.id}>
            <strong>{item.userName} - Rs. {item.amountInr}</strong>
            <span className="support-copy">
              Requested on {new Date(item.requestedAt).toLocaleString()} - {item.userEmail}
            </span>
            <div className="topbar-chip-group">
              <StatusBadge
                tone={
                  item.status === "pending"
                    ? "warning"
                    : item.status === "rejected"
                      ? "danger"
                      : "success"
                }
              >
                {item.status}
              </StatusBadge>
            </div>
            <div className="hero-actions">
              {item.status === "pending" ? (
                <>
                  <button className="button secondary" onClick={() => handleAction(item.id, "approve")} type="button">
                    Approve
                  </button>
                  <button className="button ghost danger" onClick={() => handleAction(item.id, "reject")} type="button">
                    Reject
                  </button>
                </>
              ) : null}
              {item.status === "approved" ? (
                <button className="button primary" onClick={() => handleAction(item.id, "mark_paid")} type="button">
                  Mark paid
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
