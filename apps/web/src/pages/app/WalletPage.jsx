import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyStateCard } from "../../components/ui/EmptyStateCard.jsx";
import { FinanceStatCard } from "../../components/ui/FinanceStatCard.jsx";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { fetchWallet } from "../../services/api/index.js";

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
        <EmptyStateCard
          title="Withdrawal controls"
          description="Create, monitor, and cancel payout requests from the withdrawals section when you want to reserve part of your available balance."
          action={<Link className="button secondary" to="/app/withdrawals">Open withdrawals</Link>}
        />
      </div>

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
                <strong>{item.type}</strong>
                <span className="support-copy">
                  {item.direction} - Rs. {item.amountInr} - {new Date(item.createdAt).toLocaleString()}
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
