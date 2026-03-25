import { useEffect, useState } from "react";
import { AdminMetricCard } from "../../components/ui/AdminMetricCard.jsx";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
  fetchAdminAlerts,
  fetchAdminAnalyticsOverview,
  fetchAdminTrendAnalytics,
} from "../../services/api/index.js";

function TrendList({ title, items, valueLabel = "Purchases" }) {
  return (
    <article className="detail-card">
      <SectionHeader eyebrow="Trend" title={title} />
      <div className="activity-list">
        {items.length ? items.map((item) => (
          <article className="activity-item" key={`${title}-${item.label || item.title}`}>
            <strong>{item.label || item.title}</strong>
            <span className="support-copy">
              {valueLabel}: {item.purchases ?? item.salesCount ?? item.viewCount ?? 0}
            </span>
          </article>
        )) : <p className="support-copy">No trend data yet.</p>}
      </div>
    </article>
  );
}

export function AdminAnalyticsPage() {
  const { accessToken } = useAuth();
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadInsights() {
      setIsLoading(true);
      setError("");
      try {
        const [overviewResponse, trendsResponse, alertsResponse] = await Promise.all([
          fetchAdminAnalyticsOverview(accessToken),
          fetchAdminTrendAnalytics(accessToken),
          fetchAdminAlerts(accessToken),
        ]);
        if (active) {
          setOverview(overviewResponse.data);
          setTrends(trendsResponse.data);
          setAlerts(alertsResponse.data);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || "Unable to load analytics.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    if (accessToken) {
      loadInsights();
    }

    return () => {
      active = false;
    };
  }, [accessToken]);

  if (isLoading) {
    return <LoadingCard message="Loading admin analytics..." />;
  }

  const metrics = overview?.metrics || {};
  const summary = alerts?.summary || {};

  return (
    <section className="stack-section">
      <SectionHeader
        eyebrow="Advanced analytics"
        title="Platform intelligence and growth signals"
        description="Track health, commerce performance, semester supply, and operational risk from one data-dense analytics view."
      />
      {error ? <p className="form-error">{error}</p> : null}

      <div className="card-grid">
        <AdminMetricCard label="Verified users" value={metrics.verifiedUsers || 0} description="Accounts with verified email status." />
        <AdminMetricCard label="Blocked users" value={metrics.blockedUsers || 0} description="Accounts currently blocked or restricted." />
        <AdminMetricCard label="Uploaded documents" value={metrics.totalUploadedDocuments || 0} description="Source document uploads across the platform." />
        <AdminMetricCard label="Published listings" value={metrics.totalPublishedListings || 0} description="Listings currently visible in the marketplace." />
        <AdminMetricCard label="Failed payments" value={metrics.failedPayments || 0} description="Failed private and marketplace payments." />
        <AdminMetricCard label="Marketplace revenue" value={`Rs. ${metrics.totalMarketplaceRevenue || 0}`} description="Gross revenue from marketplace purchases." />
        <AdminMetricCard label="Completed payouts" value={metrics.totalCompletedPayouts || 0} description="Withdrawal requests marked paid." />
        <AdminMetricCard label="Upcoming locked" value={metrics.totalUpcomingLockedPdfs || 0} description="Visible locked PDFs waiting for release." />
      </div>

      <div className="two-column-grid admin-grid">
        <TrendList title="Popular universities" items={trends?.popularUniversities || []} />
        <TrendList title="Popular subjects" items={trends?.popularSubjects || []} />
        <TrendList title="Popular semesters" items={trends?.popularSemesters || []} />
        <TrendList title="Popular branches" items={trends?.popularBranches || []} />
      </div>

      <div className="two-column-grid admin-grid">
        <article className="detail-card">
          <SectionHeader eyebrow="Top PDFs" title="Best-selling marketplace content" />
          <div className="activity-list">
            {(trends?.topSellingPdfs || []).map((item) => (
              <article className="activity-item" key={item.id}>
                <strong>{item.title}</strong>
                <span className="support-copy">
                  Sales {item.salesCount} - Views {item.viewCount} - Rs. {item.priceInr}
                </span>
              </article>
            ))}
          </div>
        </article>
        <article className="detail-card">
          <SectionHeader eyebrow="Top visibility" title="Most-viewed public listings" />
          <div className="activity-list">
            {(trends?.topViewedListings || []).map((item) => (
              <article className="activity-item" key={item.id}>
                <strong>{item.title}</strong>
                <span className="support-copy">
                  Views {item.viewCount} - Sales {item.salesCount} - {item.taxonomy?.subject}
                </span>
              </article>
            ))}
          </div>
        </article>
      </div>

      <div className="two-column-grid admin-grid">
        <article className="detail-card">
          <SectionHeader eyebrow="Semester supply" title="Current content distribution" />
          <div className="activity-list">
            {(overview?.semesterContentCounts || []).map((item) => (
              <article className="activity-item" key={item.semester}>
                <strong>{item.semester}</strong>
                <span className="support-copy">{item.listings} published listings</span>
              </article>
            ))}
          </div>
        </article>
        <article className="detail-card">
          <SectionHeader eyebrow="Risk snapshot" title="Alert counts to review" />
          <div className="info-grid">
            <div><span className="info-label">Pending withdrawals</span><strong>{summary.pendingWithdrawalAlerts || 0}</strong></div>
            <div><span className="info-label">Failed payment clusters</span><strong>{summary.repeatedFailedPaymentAlerts || 0}</strong></div>
            <div><span className="info-label">Risky users</span><strong>{summary.riskyUserAlerts || 0}</strong></div>
            <div><span className="info-label">Flagged listings</span><strong>{summary.flaggedListingAlerts || 0}</strong></div>
            <div><span className="info-label">Overdue upcoming</span><strong>{summary.overdueUpcomingAlerts || 0}</strong></div>
          </div>
        </article>
      </div>
    </section>
  );
}
