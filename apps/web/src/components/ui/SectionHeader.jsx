export function SectionHeader({ eyebrow, title, description, action = null }) {
  return (
    <div className="section-header">
      <div className="section-header-copy">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {description ? <p className="support-copy">{description}</p> : null}
      </div>
      {action ? <div className="section-header-action">{action}</div> : null}
    </div>
  );
}
