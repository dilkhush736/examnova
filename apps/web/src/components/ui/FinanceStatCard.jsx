export function FinanceStatCard({ label, value, description }) {
  return (
    <article className="detail-card finance-stat-card">
      <span className="info-label">{label}</span>
      <strong>{value}</strong>
      {description ? <p className="support-copy">{description}</p> : null}
    </article>
  );
}
