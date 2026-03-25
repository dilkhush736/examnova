import { useEffect, useState } from "react";
import { EmptyStateCard } from "../../components/ui/EmptyStateCard.jsx";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
  cancelWithdrawal,
  createWithdrawal,
  fetchWallet,
  fetchWithdrawals,
} from "../../services/api/index.js";

export function WithdrawalRequestsPage() {
  const { accessToken } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [items, setItems] = useState([]);
  const [amountInr, setAmountInr] = useState("");
  const [userNote, setUserNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    let active = true;

    async function loadFinanceState() {
      setIsLoading(true);
      try {
        const [walletResponse, withdrawalsResponse] = await Promise.all([
          fetchWallet(accessToken),
          fetchWithdrawals(accessToken),
        ]);
        if (!active) {
          return;
        }
        setWallet(walletResponse.data.wallet);
        setItems(withdrawalsResponse.data.items);
      } catch (error) {
        if (active) {
          setFeedback({ type: "error", message: error.message || "Unable to load withdrawal requests." });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    if (accessToken) {
      loadFinanceState();
    }

    return () => {
      active = false;
    };
  }, [accessToken]);

  async function refreshFinanceState() {
    const [walletResponse, withdrawalsResponse] = await Promise.all([
      fetchWallet(accessToken),
      fetchWithdrawals(accessToken),
    ]);
    setWallet(walletResponse.data.wallet);
    setItems(withdrawalsResponse.data.items);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback({ type: "", message: "" });
    setIsSubmitting(true);

    try {
      await createWithdrawal(accessToken, {
        amountInr: Number(amountInr),
        userNote,
        payoutMethod: "manual",
      });
      setAmountInr("");
      setUserNote("");
      await refreshFinanceState();
      setFeedback({ type: "success", message: "Withdrawal request submitted successfully." });
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to create withdrawal request." });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancel(withdrawalId) {
    setFeedback({ type: "", message: "" });
    try {
      await cancelWithdrawal(accessToken, withdrawalId);
      await refreshFinanceState();
      setFeedback({ type: "success", message: "Withdrawal request cancelled successfully." });
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to cancel withdrawal request." });
    }
  }

  if (isLoading) {
    return <LoadingCard message="Loading withdrawal requests..." />;
  }

  return (
    <section className="stack-section">
      <SectionHeader
        eyebrow="Withdrawals"
        title="Withdrawal requests"
        description="Reserve earnings from your wallet, track request status, and keep payout requests organized for admin review."
      />
      {feedback.message ? (
        <p className={feedback.type === "error" ? "form-error" : "form-success"}>{feedback.message}</p>
      ) : null}

      <div className="two-column-grid">
        <form className="detail-card profile-form" onSubmit={handleSubmit}>
          <div className="section-header">
            <div>
              <p className="eyebrow">Create request</p>
              <h2>Reserve a payout amount</h2>
              <p className="support-copy">
                Available right now: Rs. {wallet?.availableBalance || 0}. Creating a request immediately places a ledger hold until it is cancelled or processed later by admin.
              </p>
            </div>
          </div>

          <label className="field">
            <span>Amount</span>
            <input
              className="input"
              min="1"
              onChange={(event) => setAmountInr(event.target.value)}
              type="number"
              value={amountInr}
            />
          </label>

          <label className="field">
            <span>Note</span>
            <textarea
              className="input textarea"
              onChange={(event) => setUserNote(event.target.value)}
              placeholder="Optional context for the payout request"
              value={userNote}
            />
          </label>

          <div className="hero-actions">
            <button className="button primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Submitting..." : "Create withdrawal request"}
            </button>
          </div>
        </form>

        <article className="detail-card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Balance context</p>
              <h2>Withdrawal summary</h2>
            </div>
          </div>
          <div className="info-grid">
            <div><span className="info-label">Available</span><strong>Rs. {wallet?.availableBalance || 0}</strong></div>
            <div><span className="info-label">Pending reserved</span><strong>Rs. {wallet?.pendingWithdrawalAmount || 0}</strong></div>
            <div><span className="info-label">Lifetime earnings</span><strong>Rs. {wallet?.lifetimeEarnings || 0}</strong></div>
            <div><span className="info-label">Total withdrawn</span><strong>Rs. {wallet?.totalWithdrawn || 0}</strong></div>
          </div>
        </article>
      </div>

      {items.length ? (
        <div className="activity-list">
          {items.map((item) => (
            <article className="activity-item" key={item.id}>
              <strong>Rs. {item.amountInr} - {item.status}</strong>
              <span className="support-copy">
                Requested on {new Date(item.requestedAt).toLocaleString()}
                {item.userNote ? ` - ${item.userNote}` : ""}
              </span>
              {item.status === "pending" ? (
                <div className="hero-actions">
                  <button className="button ghost" onClick={() => handleCancel(item.id)} type="button">
                    Cancel request
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <EmptyStateCard
          title="No withdrawal requests"
          description="Once you reserve part of your available balance for payout, your request history will appear here."
        />
      )}
    </section>
  );
}
