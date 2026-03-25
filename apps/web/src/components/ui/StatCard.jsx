export function StatCard({ label, value }) {
  return (
    <article className="stat-card">
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
