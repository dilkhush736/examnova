import { useEffect, useState } from "react";
import { EmptyStateCard } from "../../components/ui/EmptyStateCard.jsx";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { fetchAdminWithdrawals, updateAdminWithdrawalStatus } from "../../services/api/index.js";

function getStatusTone(status) {
  if (status === "pending") {
    return "warning";
  }
  if (status === "rejected" || status === "cancelled") {
    return "danger";
  }
  return "success";
}

function getPayoutMethodLabel(method) {
  return method === "bank_account" ? "Bank account" : method === "manual" ? "Manual" : "UPI";
}

function createDraftState() {
  return {
    adminNote: "",
    payoutReference: "",
  };
}

export function AdminWithdrawalsPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState({});
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

  function getDraft(withdrawalId) {
    return drafts[withdrawalId] || createDraftState();
  }

  function updateDraft(withdrawalId, key, value) {
    setDrafts((current) => ({
      ...current,
      [withdrawalId]: {
        ...(current[withdrawalId] || createDraftState()),
        [key]: value,
      },
    }));
  }

  async function handleAction(withdrawalId, action) {
    const draft = getDraft(withdrawalId);

    try {
      const response = await updateAdminWithdrawalStatus(accessToken, withdrawalId, {
        action,
        adminNote: draft.adminNote,
        payoutReference: draft.payoutReference,
      });
      setItems((current) => current.map((item) => (item.id === withdrawalId ? response.data.item : item)));
      setFeedback({ type: "success", message: `Withdrawal ${action} action completed successfully.` });
      setDrafts((current) => {
        const next = { ...current };
        delete next[withdrawalId];
        return next;
      });
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
        description="Review seller payout details, add admin notes, approve or reject requests, and record payout references when marking withdrawals as paid."
      />
      {feedback.message ? (
        <p className={feedback.type === "error" ? "form-error" : "form-success"}>{feedback.message}</p>
      ) : null}

      {items.length ? (
        <div className="activity-list">
          {items.map((item) => {
            const draft = getDraft(item.id);

            return (
              <article className="detail-card withdrawal-request-card" key={item.id}>
                <div className="section-header">
                  <div>
                    <p className="eyebrow">Seller payout request</p>
                    <h3>{item.userName} - Rs. {item.amountInr}</h3>
                    <p className="support-copy">
                      {getPayoutMethodLabel(item.payoutMethod)} - {item.payoutSummary || item.accountReference || "Payout details captured"}
                    </p>
                  </div>
                  <div className="topbar-chip-group">
                    <StatusBadge tone={getStatusTone(item.status)}>{item.status}</StatusBadge>
                    <StatusBadge tone="neutral">{getPayoutMethodLabel(item.payoutMethod)}</StatusBadge>
                  </div>
                </div>

                <div className="info-grid">
                  <div><span className="info-label">Seller</span><strong>{item.userEmail}</strong></div>
                  <div><span className="info-label">Requested</span><strong>{new Date(item.requestedAt).toLocaleString()}</strong></div>
                  <div><span className="info-label">Account holder</span><strong>{item.payoutDetails?.accountHolderName || "Not provided"}</strong></div>
                  <div><span className="info-label">Account reference</span><strong>{item.accountReference || "Not provided"}</strong></div>
                  <div><span className="info-label">IFSC</span><strong>{item.payoutDetails?.ifscCode || "Not applicable"}</strong></div>
                  <div><span className="info-label">Payout reference</span><strong>{item.payoutReference || "Pending"}</strong></div>
                </div>

                {item.userNote ? <p className="support-copy">Seller note: {item.userNote}</p> : null}
                {item.adminNote ? <p className="support-copy">Existing admin note: {item.adminNote}</p> : null}

                <div className="stack-section">
                  <label className="field">
                    <span>Admin note</span>
                    <textarea
                      className="input textarea"
                      onChange={(event) => updateDraft(item.id, "adminNote", event.target.value)}
                      placeholder="Add a review note for the seller record"
                      value={draft.adminNote}
                    />
                  </label>

                  {item.status === "approved" ? (
                    <label className="field">
                      <span>Payout reference</span>
                      <input
                        className="input"
                        onChange={(event) => updateDraft(item.id, "payoutReference", event.target.value)}
                        placeholder="Bank transfer UTR / payout reference"
                        value={draft.payoutReference}
                      />
                    </label>
                  ) : null}
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
                    <button
                      className="button primary"
                      disabled={!String(draft.payoutReference || item.payoutReference || "").trim()}
                      onClick={() => handleAction(item.id, "mark_paid")}
                      type="button"
                    >
                      Mark paid
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyStateCard
          title="No withdrawal requests"
          description="Seller payout requests will appear here as soon as Developer Mode users move wallet balance into the withdrawal review queue."
        />
      )}
    </section>
  );
}
