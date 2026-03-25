export function AdminMetricCard({ label, value, description }) {
  return (
    <article className="detail-card admin-metric-card">
      <span className="info-label metric-label">{label}</span>
      <strong>{value}</strong>
      {description ? <p className="support-copy">{description}</p> : null}
    </article>
  );
}
