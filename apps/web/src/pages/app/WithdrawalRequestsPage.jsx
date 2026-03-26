import { useEffect, useState } from "react";
import { EmptyStateCard } from "../../components/ui/EmptyStateCard.jsx";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
  cancelWithdrawal,
  createWithdrawal,
  fetchWallet,
  fetchWithdrawals,
} from "../../services/api/index.js";

function createInitialWithdrawalForm() {
  return {
    amountInr: "",
    payoutMethod: "upi",
    accountHolderName: "",
    upiId: "",
    bankAccountNumber: "",
    ifscCode: "",
    userNote: "",
  };
}

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

function getWithdrawalSummary(item) {
  if (item.payoutSummary) {
    return item.payoutSummary;
  }

  if (item.payoutMethod === "bank_account") {
    return [item.payoutDetails?.accountHolderName || "", item.accountReference || "", item.payoutDetails?.ifscCode || ""]
      .filter(Boolean)
      .join(" - ");
  }

  return [item.payoutDetails?.accountHolderName || "", item.accountReference || item.payoutDetails?.upiId || ""]
    .filter(Boolean)
    .join(" - ");
}

export function WithdrawalRequestsPage() {
  const { accessToken } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(createInitialWithdrawalForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const payoutFieldsReady =
    form.amountInr &&
    form.accountHolderName.trim() &&
    (form.payoutMethod === "upi"
      ? form.upiId.trim()
      : form.bankAccountNumber.trim() && form.ifscCode.trim());

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

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback({ type: "", message: "" });
    setIsSubmitting(true);

    try {
      await createWithdrawal(accessToken, {
        amountInr: Number(form.amountInr),
        payoutMethod: form.payoutMethod,
        userNote: form.userNote,
        payoutDetails: {
          accountHolderName: form.accountHolderName,
          upiId: form.payoutMethod === "upi" ? form.upiId : "",
          bankAccountNumber: form.payoutMethod === "bank_account" ? form.bankAccountNumber : "",
          ifscCode: form.payoutMethod === "bank_account" ? form.ifscCode : "",
        },
      });
      setForm(createInitialWithdrawalForm());
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
        description="Move seller earnings from wallet balance into a clear payout queue with verified UPI or bank details for admin review."
      />
      {feedback.message ? (
        <p className={feedback.type === "error" ? "form-error" : "form-success"}>{feedback.message}</p>
      ) : null}

      <div className="two-column-grid">
        <form className="detail-card profile-form" onSubmit={handleSubmit}>
          <div className="section-header">
            <div>
              <p className="eyebrow">Create request</p>
              <h2>Request a seller payout</h2>
              <p className="support-copy">
                Available now: Rs. {wallet?.availableBalance || 0}. Your payout request immediately reserves this amount in the ledger until admin approves, rejects, or marks it paid.
              </p>
            </div>
          </div>

          <article className="guided-inline-card">
            <div className="guided-inline-card-copy">
              <strong>Developer Mode seller rule</strong>
              <p className="support-copy">
                User-sold marketplace PDFs credit {wallet?.sellerRevenueSharePercent || 70}% to the seller wallet after successful payment verification. Admin-owned PDFs stay platform-owned.
              </p>
            </div>
            <div className="guided-pill-row">
              <span className="guided-pill">Seller share {wallet?.sellerRevenueSharePercent || 70}%</span>
              <span className="guided-pill subtle">Admin review required</span>
            </div>
          </article>

          <div className="payout-method-grid">
            <button
              className={`payout-method-card ${form.payoutMethod === "upi" ? "active" : ""}`}
              onClick={() => updateForm("payoutMethod", "upi")}
              type="button"
            >
              <strong>UPI payout</strong>
              <span className="support-copy">Fastest option for individual seller withdrawals.</span>
            </button>
            <button
              className={`payout-method-card ${form.payoutMethod === "bank_account" ? "active" : ""}`}
              onClick={() => updateForm("payoutMethod", "bank_account")}
              type="button"
            >
              <strong>Bank transfer</strong>
              <span className="support-copy">Use account number and IFSC when you want direct bank payout.</span>
            </button>
          </div>

          <div className="two-column-grid compact">
            <label className="field">
              <span>Amount</span>
              <input
                className="input"
                min="1"
                onChange={(event) => updateForm("amountInr", event.target.value)}
                placeholder="Example: 350"
                type="number"
                value={form.amountInr}
              />
            </label>
            <label className="field">
              <span>Account holder name</span>
              <input
                className="input"
                onChange={(event) => updateForm("accountHolderName", event.target.value)}
                placeholder="Exact payout account holder name"
                value={form.accountHolderName}
              />
            </label>
          </div>

          {form.payoutMethod === "upi" ? (
            <label className="field">
              <span>UPI ID</span>
              <input
                className="input"
                onChange={(event) => updateForm("upiId", event.target.value)}
                placeholder="example@upi"
                value={form.upiId}
              />
            </label>
          ) : (
            <div className="two-column-grid compact">
              <label className="field">
                <span>Bank account number</span>
                <input
                  className="input"
                  onChange={(event) => updateForm("bankAccountNumber", event.target.value)}
                  placeholder="Digits only"
                  value={form.bankAccountNumber}
                />
              </label>
              <label className="field">
                <span>IFSC code</span>
                <input
                  className="input"
                  onChange={(event) => updateForm("ifscCode", event.target.value.toUpperCase())}
                  placeholder="Example: SBIN0001234"
                  value={form.ifscCode}
                />
              </label>
            </div>
          )}

          <label className="field">
            <span>Seller note</span>
            <textarea
              className="input textarea"
              onChange={(event) => updateForm("userNote", event.target.value)}
              placeholder="Optional note for admin about this payout request"
              value={form.userNote}
            />
          </label>

          <div className="hero-actions">
            <button className="button primary" disabled={isSubmitting || !payoutFieldsReady} type="submit">
              {isSubmitting ? "Submitting..." : "Create withdrawal request"}
            </button>
          </div>
        </form>

        <article className="detail-card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Balance context</p>
              <h2>Withdrawal summary</h2>
              <p className="support-copy">
                Use this before requesting payout so you know what is free to withdraw, what is already reserved, and what has already moved through the payout cycle.
              </p>
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
            <article className="detail-card withdrawal-request-card" key={item.id}>
              <div className="section-header">
                <div>
                  <p className="eyebrow">Withdrawal request</p>
                  <h3>Rs. {item.amountInr}</h3>
                  <p className="support-copy">
                    {getPayoutMethodLabel(item.payoutMethod)} - {getWithdrawalSummary(item) || "Payout details available on this request"}
                  </p>
                </div>
                <div className="topbar-chip-group">
                  <StatusBadge tone={getStatusTone(item.status)}>{item.status}</StatusBadge>
                  <StatusBadge tone="neutral">{getPayoutMethodLabel(item.payoutMethod)}</StatusBadge>
                </div>
              </div>

              <div className="info-grid">
                <div><span className="info-label">Requested</span><strong>{new Date(item.requestedAt).toLocaleString()}</strong></div>
                <div><span className="info-label">Account reference</span><strong>{item.accountReference || "Captured"}</strong></div>
                <div><span className="info-label">Admin note</span><strong>{item.adminNote || "No admin note yet"}</strong></div>
                <div><span className="info-label">Payout reference</span><strong>{item.payoutReference || "Pending"}</strong></div>
              </div>

              {item.userNote ? <p className="support-copy">Seller note: {item.userNote}</p> : null}

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
          description="As soon as you reserve part of your available balance for payout, the request history and admin review status will appear here."
        />
      )}
    </section>
  );
}
