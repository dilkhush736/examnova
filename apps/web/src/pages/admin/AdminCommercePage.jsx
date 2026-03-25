import { useEffect, useState } from "react";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { fetchAdminPayments, fetchAdminPurchases } from "../../services/api/index.js";

export function AdminCommercePage() {
  const { accessToken } = useAuth();
  const [payments, setPayments] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadCommerce() {
      setIsLoading(true);
      try {
        const [paymentsResponse, purchasesResponse] = await Promise.all([
          fetchAdminPayments(accessToken),
          fetchAdminPurchases(accessToken),
        ]);
        if (active) {
          setPayments(paymentsResponse.data.items);
          setPurchases(purchasesResponse.data.items);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    if (accessToken) {
      loadCommerce();
    }
    return () => {
      active = false;
    };
  }, [accessToken]);

  if (isLoading) {
    return <LoadingCard message="Loading admin commerce..." />;
  }

  return (
    <section className="stack-section">
      <SectionHeader
        eyebrow="Admin commerce"
        title="Purchases and payments"
        description="Inspect private PDF and marketplace payment activity without digging through raw database records."
      />
      <div className="two-column-grid admin-grid">
        <section className="detail-card">
          <SectionHeader eyebrow="Payments" title="Payment records" description="Successful, failed, and pending payment contexts." />
          <div className="activity-list">
            {payments.map((item) => (
              <article className="activity-item" key={item.id}>
                <strong>{item.contextType} - Rs. {item.amountInr}</strong>
                <span className="support-copy">{item.userName} {item.listingTitle ? `- ${item.listingTitle}` : ""}</span>
                <div className="topbar-chip-group">
                  <StatusBadge tone={item.status === "paid" ? "success" : item.status === "failed" ? "danger" : "warning"}>
                    {item.status}
                  </StatusBadge>
                  <StatusBadge tone="neutral">{item.provider}</StatusBadge>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="detail-card">
          <SectionHeader eyebrow="Purchases" title="Completed access grants" description="Buyer access state and revenue split visibility." />
          <div className="activity-list">
            {purchases.map((item) => (
              <article className="activity-item" key={item.id}>
                <strong>{item.listingTitle || item.id}</strong>
                <span className="support-copy">
                  Buyer: {item.buyerName} - Seller: {item.sellerName} - Rs. {item.amountInr}
                </span>
                <div className="topbar-chip-group">
                  <StatusBadge tone="success">{item.paymentStatus}</StatusBadge>
                  <StatusBadge tone="neutral">Admin Rs. {item.adminCommissionAmount}</StatusBadge>
                  <StatusBadge tone="success">Seller Rs. {item.sellerEarningAmount}</StatusBadge>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
