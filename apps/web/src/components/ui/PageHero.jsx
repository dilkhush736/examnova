export function PageHero({ eyebrow, title, description, actions = null }) {
  return (
    <section className="hero-card">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      <p className="support-copy">{description}</p>
      {actions ? <div className="hero-actions">{actions}</div> : null}
    </section>
  );
}
