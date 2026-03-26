import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyStateCard } from "../../components/ui/EmptyStateCard.jsx";
import { FinanceStatCard } from "../../components/ui/FinanceStatCard.jsx";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { fetchWallet } from "../../services/api/index.js";

function getTransactionTone(item) {
  return item.direction === "credit" ? "success" : item.type.includes("release") ? "neutral" : "warning";
}

function getTransactionTitle(item) {
  if (item.type === "marketplace_sale_credit") {
    return "Marketplace sale credited";
  }
  if (item.type === "withdrawal_hold") {
    return "Withdrawal reserved";
  }
  if (item.type === "withdrawal_release" || item.type === "withdrawal_rejection_release") {
    return "Withdrawal amount released";
  }
  return item.type;
}

export function WalletPage() {
  const { accessToken } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadWallet() {
      setIsLoading(true);
      try {
        const response = await fetchWallet(accessToken);
        if (active) {
          setWallet(response.data.wallet);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || "Unable to load wallet data.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    if (accessToken) {
      loadWallet();
    }

    return () => {
      active = false;
    };
  }, [accessToken]);

  if (isLoading) {
    return <LoadingCard message="Loading wallet..." />;
  }

  return (
    <section className="stack-section">
      <SectionHeader
        eyebrow="Wallet"
        title="Wallet, earnings, and withdrawal center"
        description="Your available balance, reserved withdrawal amounts, and seller transaction history are tracked through the finance ledger."
      />
      {error ? <p className="form-error">{error}</p> : null}

      <section className="card-grid">
        <FinanceStatCard
          description="Amount currently available for a new withdrawal request."
          label="Available balance"
          value={`Rs. ${wallet?.availableBalance || 0}`}
        />
        <FinanceStatCard
          description="All marketplace earnings credited to your wallet."
          label="Lifetime earnings"
          value={`Rs. ${wallet?.lifetimeEarnings || 0}`}
        />
        <FinanceStatCard
          description="Reserved in pending withdrawal requests."
          label="Pending withdrawals"
          value={`Rs. ${wallet?.pendingWithdrawalAmount || 0}`}
        />
        <FinanceStatCard
          description="Withdrawals marked approved or paid in the payout lifecycle."
          label="Total withdrawn"
          value={`Rs. ${wallet?.totalWithdrawn || 0}`}
        />
      </section>

      <div className="two-column-grid">
        <article className="detail-card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Seller payout rule</p>
              <h2>How marketplace earnings land here</h2>
              <p className="support-copy">
                Developer Mode user-sold PDFs credit {wallet?.sellerRevenueSharePercent || 70}% to your seller wallet after verified payment. The remaining share stays with the platform according to current business rules.
              </p>
            </div>
            <StatusBadge tone="success">{wallet?.sellerRevenueSharePercent || 70}% seller share</StatusBadge>
          </div>
          <div className="info-grid">
            <div><span className="info-label">Seller share</span><strong>{wallet?.sellerRevenueSharePercent || 70}%</strong></div>
            <div><span className="info-label">Platform share</span><strong>{100 - (wallet?.sellerRevenueSharePercent || 70)}%</strong></div>
            <div><span className="info-label">Credits</span><strong>Rs. {wallet?.totalCredits || 0}</strong></div>
            <div><span className="info-label">Debits</span><strong>Rs. {wallet?.totalDebits || 0}</strong></div>
          </div>
        </article>
        <article className="detail-card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Ledger totals</p>
              <h2>Credit and debit snapshot</h2>
            </div>
          </div>
          <div className="info-grid">
            <div><span className="info-label">Credits</span><strong>Rs. {wallet?.totalCredits || 0}</strong></div>
            <div><span className="info-label">Debits</span><strong>Rs. {wallet?.totalDebits || 0}</strong></div>
            <div><span className="info-label">Currency</span><strong>{wallet?.currency || "INR"}</strong></div>
            <div><span className="info-label">Transactions tracked</span><strong>{wallet?.transactions?.length || 0}</strong></div>
          </div>
        </article>
      </div>

      <EmptyStateCard
        title="Withdrawal controls"
        description="Create, monitor, and cancel payout requests from the withdrawals section when you want to reserve part of your available balance."
        action={<Link className="button secondary" to="/app/withdrawals">Open withdrawals</Link>}
      />

      <section className="detail-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Transactions</p>
            <h2>Recent ledger activity</h2>
          </div>
        </div>
        {wallet?.transactions?.length ? (
          <div className="activity-list">
            {wallet.transactions.map((item) => (
              <article className="activity-item" key={item.id}>
                <div className="section-header">
                  <div>
                    <strong>{getTransactionTitle(item)}</strong>
                    <span className="support-copy">
                      {item.note || "Wallet ledger entry"} - {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="topbar-chip-group">
                    <StatusBadge tone={getTransactionTone(item)}>
                      {item.direction === "credit" ? `+Rs. ${item.amountInr}` : `-Rs. ${item.amountInr}`}
                    </StatusBadge>
                    <StatusBadge tone="neutral">Balance Rs. {item.balanceAfter}</StatusBadge>
                  </div>
                </div>
                <span className="support-copy">
                  {item.metadata?.listingTitle
                    ? `${item.metadata.listingTitle} - ${item.metadata?.sellerSharePercent || wallet?.sellerRevenueSharePercent || 70}% seller credit`
                    : item.sourceType === "withdrawal_request"
                      ? "Linked to a withdrawal request."
                      : "Tracked in the finance ledger."}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <EmptyStateCard
            title="No wallet transactions yet"
            description="Seller credits, withdrawal holds, and future finance adjustments will appear here."
          />
        )}
      </section>
    </section>
  );
}
