import { Link } from "react-router-dom";
import {
  getServiceCategoryLabel,
} from "../../features/marketplace/marketplace.constants.js";

export function ServiceListingCard({ service }) {
  const pricing = service.pricing || {};

  return (
    <article className="marketplace-card service-listing-card">
      {service.imageUrl ? (
        <div className="simple-card-cover service-card-cover">
          <img alt={`${service.title} preview`} className="simple-card-cover-image" loading="lazy" src={service.imageUrl} />
        </div>
      ) : null}
      <div className="marketplace-card-copy simple-card-copy">
        <p className="eyebrow">{getServiceCategoryLabel(service.category)}</p>
        <h3>{service.title}</h3>
        <p className="support-copy">{service.shortDescription}</p>
      </div>
      <div className="marketplace-taxonomy">
        {(service.techStack || []).slice(0, 4).map((item) => (
          <span key={`${service.id}-${item}`}>{item}</span>
        ))}
      </div>
      <div className="service-card-price-row">
        <strong>Rs. {pricing.currentPriceInr || 0}</strong>
        {pricing.discountPercent ? (
          <span className="status-chip muted">
            Rs. {pricing.basePriceInr} base - {pricing.discountPercent}% off
          </span>
        ) : null}
      </div>
      <div className="hero-actions card-actions">
        {service.demoUrl ? (
          <a className="button ghost" href={service.demoUrl} rel="noreferrer" target="_blank">
            <i className="bi bi-box-arrow-up-right" />
            Live demo
          </a>
        ) : null}
        <Link className="button primary" to={`/services/${service.slug}`}>
          <i className="bi bi-window-stack" />
          View details
        </Link>
      </div>
    </article>
  );
}
