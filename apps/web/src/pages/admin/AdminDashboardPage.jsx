import { useEffect, useState } from "react";
import { AdminMetricCard } from "../../components/ui/AdminMetricCard.jsx";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { fetchAdminDashboard } from "../../services/api/index.js";

export function AdminDashboardPage() {
  const { accessToken } = useAuth();
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadSummary() {
      setIsLoading(true);
      try {
        const response = await fetchAdminDashboard(accessToken);
        if (active) {
          setSummary(response.data);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || "Unable to load admin dashboard.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    if (accessToken) {
      loadSummary();
    }
    return () => {
      active = false;
    };
  }, [accessToken]);

  if (isLoading) {
    return <LoadingCard message="Loading admin overview..." />;
  }

  const metrics = summary?.metrics || {};

  return (
    <section className="stack-section">
      <SectionHeader
        eyebrow="Admin overview"
        title="Platform operations dashboard"
        description="Track user growth, content volume, payments, and payout exposure from one modern control center."
      />
      {error ? <p className="form-error">{error}</p> : null}
      <div className="card-grid">
        <AdminMetricCard description="Accounts on the platform." label="Total users" value={metrics.totalUsers || 0} />
        <AdminMetricCard description="Currently active and not blocked." label="Active users" value={metrics.activeUsers || 0} />
        <AdminMetricCard description="Total generated answer/PDF records." label="Generated PDFs" value={metrics.totalGeneratedPdfs || 0} />
        <AdminMetricCard description="Admin-uploaded premium PDFs." label="Admin uploads" value={metrics.totalAdminUploadedPdfs || 0} />
        <AdminMetricCard description="Public marketplace supply." label="Listings" value={metrics.totalMarketplaceListings || 0} />
        <AdminMetricCard description="Locked public releases waiting to drop." label="Upcoming locked" value={metrics.totalUpcomingLockedPdfs || 0} />
        <AdminMetricCard description="Buyer access grants completed." label="Purchases" value={metrics.totalPurchases || 0} />
        <AdminMetricCard description="All private and marketplace payment records." label="Payments" value={metrics.totalPayments || 0} />
        <AdminMetricCard description="Requests waiting for finance review." label="Pending withdrawals" value={metrics.pendingWithdrawalRequests || 0} />
        <AdminMetricCard description="Commission already recorded by the platform." label="Admin revenue" value={`Rs. ${metrics.adminRevenue || 0}`} />
      </div>
      <div className="two-column-grid admin-grid">
        <article className="detail-card">
          <SectionHeader eyebrow="Finance snapshot" title="Platform finance posture" description="Current marketplace earning distribution." />
          <div className="info-grid">
            <div><span className="info-label">Admin revenue</span><strong>Rs. {metrics.adminRevenue || 0}</strong></div>
            <div><span className="info-label">Seller earnings</span><strong>Rs. {metrics.totalSellerEarnings || 0}</strong></div>
            <div><span className="info-label">Pending withdrawal amount</span><strong>Rs. {metrics.pendingWithdrawalAmount || 0}</strong></div>
            <div><span className="info-label">Pending requests</span><strong>{metrics.pendingWithdrawalRequests || 0}</strong></div>
          </div>
        </article>
        <article className="detail-card">
          <SectionHeader eyebrow="Operational focus" title="Immediate admin priorities" description="High-signal areas to inspect next." />
          <div className="activity-list">
            <article className="activity-item"><strong>User oversight</strong><span className="support-copy">Review blocked or inactive accounts from the Users module.</span></article>
            <article className="activity-item"><strong>Admin publishing</strong><span className="support-copy">Upload premium PDFs directly and stage locked upcoming releases.</span></article>
            <article className="activity-item"><strong>Marketplace integrity</strong><span className="support-copy">Unlist problematic content or republish corrected listings.</span></article>
            <article className="activity-item"><strong>Payout review</strong><span className="support-copy">Move pending withdrawal requests through approval and paid states.</span></article>
          </div>
        </article>
      </div>
    </section>
  );
}
