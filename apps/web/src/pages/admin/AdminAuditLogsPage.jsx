import { useEffect, useState } from "react";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { fetchAdminAuditLogs } from "../../services/api/index.js";

export function AdminAuditLogsPage() {
  const { accessToken } = useAuth();
  const [filters, setFilters] = useState({ search: "", action: "", entityType: "", days: "30" });
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadLogs() {
      setIsLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            params.set(key, value);
          }
        });
        const response = await fetchAdminAuditLogs(accessToken, params.toString());
        if (active) {
          setItems(response.data.items);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || "Unable to load audit logs.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    if (accessToken) {
      loadLogs();
    }
    return () => {
      active = false;
    };
  }, [accessToken, filters]);

  if (isLoading) {
    return <LoadingCard message="Loading audit logs..." />;
  }

  return (
    <section className="stack-section">
      <SectionHeader
        eyebrow="Audit visibility"
        title="Sensitive admin action history"
        description="Review user blocks, withdrawal decisions, content moderation actions, and other important admin-controlled state changes."
      />
      {error ? <p className="form-error">{error}</p> : null}
      <div className="two-column-grid compact">
        <label className="field"><span>Search</span><input className="input" onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} value={filters.search} /></label>
        <label className="field"><span>Action</span><input className="input" onChange={(event) => setFilters((current) => ({ ...current, action: event.target.value }))} value={filters.action} /></label>
        <label className="field"><span>Entity type</span><input className="input" onChange={(event) => setFilters((current) => ({ ...current, entityType: event.target.value }))} value={filters.entityType} /></label>
        <label className="field">
          <span>Days</span>
          <select className="input" onChange={(event) => setFilters((current) => ({ ...current, days: event.target.value }))} value={filters.days}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </label>
      </div>
      <div className="activity-list">
        {items.length ? items.map((item) => (
          <article className="activity-item" key={item.id}>
            <strong>{item.action}</strong>
            <span className="support-copy">
              {item.actorName || "System"} - {item.entityType} - {new Date(item.createdAt).toLocaleString()}
            </span>
            <span className="support-copy">Request ID: {item.requestId || "N/A"} - IP: {item.ipAddress || "N/A"}</span>
          </article>
        )) : <p className="support-copy">No audit records matched the current filters.</p>}
      </div>
    </section>
  );
}
