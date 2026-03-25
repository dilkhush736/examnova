export function EmptyStateCard({ title, description, action = null }) {
  return (
    <article className="empty-state-card">
      <p className="eyebrow">Empty state</p>
      <h3>{title}</h3>
      <p className="support-copy">{description}</p>
      {action ? <div className="hero-actions">{action}</div> : null}
    </article>
  );
}
