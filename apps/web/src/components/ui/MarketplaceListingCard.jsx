import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "./StatusBadge.jsx";
import {
  formatMarketplaceDate,
  getCountdownParts,
  getCoverSealLabel,
  getListingCardDate,
  isListingReleaseLocked,
} from "../../utils/marketplaceAvailability.js";

export function MarketplaceListingCard({ listing, sellerView = false, action = null }) {
  const [now, setNow] = useState(Date.now());
  const studyMetadata = listing.studyMetadata || {};
  const isAdminUpload = listing.sourceType === "admin_upload";
  const sourceLabel = listing.sellerSourceLabel || (isAdminUpload ? "ExamNova Admin" : "Student Seller");
  const sourceTone = isAdminUpload ? "warning" : "neutral";
  const sellerLabel = listing.sellerName || (isAdminUpload ? "ExamNova Team" : "ExamNova Seller");
  const subjectLabel = listing.taxonomy?.subject || "Marketplace PDF";
  const academicSummary = [
    listing.taxonomy?.university,
    listing.taxonomy?.branch,
    listing.taxonomy?.semester ? `Semester ${listing.taxonomy.semester}` : null,
  ]
    .filter(Boolean)
    .join(" - ");
  const iconSeed = String(subjectLabel || listing.title || "P").trim().charAt(0).toUpperCase();
  const studyTags = [
    listing.taxonomy?.year,
    studyMetadata.examFocus,
    studyMetadata.difficultyLevel,
  ].filter(Boolean);
  const sealLabel = getCoverSealLabel(listing.coverSeal);
  const cardDate = formatMarketplaceDate(getListingCardDate(listing));
  const releaseLocked = isListingReleaseLocked(listing, now);
  const countdown = getCountdownParts(listing.releaseAt, now);

  useEffect(() => {
    if (!listing?.releaseAt) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [listing?.releaseAt]);

  if (sellerView) {
    return (
      <article className="marketplace-card simple-marketplace-card seller-view">
        <div className="simple-card-topline">
          {sealLabel ? <span className={`simple-cover-seal ${listing.coverSeal}`}>{sealLabel}</span> : <span />}
          <span className="simple-card-date">
            <i className="bi bi-calendar-event" />
            {cardDate || "Date pending"}
          </span>
        </div>
        <div className="marketplace-card-icon simple-card-icon" aria-hidden="true">
          {iconSeed}
        </div>
        <div className="marketplace-card-copy simple-card-copy">
          <h3>{listing.title}</h3>
          <p className="support-copy">{academicSummary || "Structured academic listing"}</p>
        </div>
        <div className="simple-card-chip-row">
          <StatusBadge tone={sourceTone}>{sourceLabel}</StatusBadge>
          <StatusBadge tone={listing.isPublished ? "success" : "warning"}>
            {listing.isPublished ? "Published" : "Draft"}
          </StatusBadge>
          {releaseLocked ? <StatusBadge tone="warning">Upcoming</StatusBadge> : null}
        </div>
        {countdown ? (
          <div className="simple-countdown-card">
            <span className="info-label">Live countdown</span>
            <strong>{countdown.shortLabel}</strong>
          </div>
        ) : null}
        <p className="support-copy simple-card-caption">
          Views {listing.viewCount || 0} - Sales {listing.salesCount || 0} - Seller {sellerLabel}
        </p>
        <div className="marketplace-taxonomy simple-card-tags">
          {studyTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="hero-actions card-actions">
          <Link className="button secondary full-width" to={`/pdf/${listing.slug}`}>
            <i className="bi bi-arrow-up-right" />
            View detail
          </Link>
          {action}
        </div>
      </article>
    );
  }

  return (
    <article className="marketplace-card simple-marketplace-card buyer-view">
      <div className="simple-card-topline">
        {sealLabel ? <span className={`simple-cover-seal ${listing.coverSeal}`}>{sealLabel}</span> : <span />}
        <span className="simple-card-date">
          <i className="bi bi-calendar-event" />
          {cardDate || "Date pending"}
        </span>
      </div>
      <div className="marketplace-card-icon simple-card-icon" aria-hidden="true">
        {iconSeed}
      </div>
      <div className="marketplace-card-copy simple-card-copy">
        <h3>{listing.title}</h3>
        <p className="support-copy">{academicSummary || "Structured academic PDF"}</p>
      </div>
      {countdown ? (
        <div className="simple-countdown-card">
          <span className="info-label">Unlocks in</span>
          <strong>{countdown.shortLabel}</strong>
        </div>
      ) : null}
      <div className="simple-card-chip-row">
        <StatusBadge tone={sourceTone}>{sourceLabel}</StatusBadge>
        <StatusBadge tone="success">Rs. {listing.priceInr}</StatusBadge>
        {releaseLocked ? <StatusBadge tone="warning">Upcoming</StatusBadge> : null}
      </div>
      <p className="support-copy simple-card-caption">
        {listing.description || "Download notes here and purchase securely after opening the PDF page."}
      </p>
      <div className="marketplace-taxonomy simple-card-tags">
        {studyTags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="hero-actions card-actions">
        <Link className="button secondary full-width" to={`/pdf/${listing.slug}`}>
          <i className={`bi ${releaseLocked ? "bi-lock" : "bi-download"}`} />
          Download PDF
        </Link>
        {action}
      </div>
    </article>
  );
}
