import { Link } from "react-router-dom";
import { StatusBadge } from "./StatusBadge.jsx";

export function MarketplaceListingCard({ listing, sellerView = false, action = null }) {
  const studyMetadata = listing.studyMetadata || {};
  const isAdminUpload = listing.sourceType === "admin_upload";
  const sourceLabel = listing.sellerSourceLabel || (isAdminUpload ? "ExamNova Admin" : "Student Seller");
  const sourceTone = isAdminUpload ? "warning" : "neutral";
  const sourceDescription = isAdminUpload ? "Official ExamNova upload" : "Uploaded by a student seller";
  const sellerLabel = listing.sellerName || (isAdminUpload ? "ExamNova Team" : "ExamNova Seller");
  const subjectLabel = listing.taxonomy?.subject || "Marketplace PDF";
  const academicSummary = [
    listing.taxonomy?.university,
    listing.taxonomy?.branch,
    listing.taxonomy?.semester ? `Semester ${listing.taxonomy.semester}` : null,
  ]
    .filter(Boolean)
    .join(" • ");
  const iconSeed = String(subjectLabel || listing.title || "P").trim().charAt(0).toUpperCase();
  const studyTags = [
    listing.taxonomy?.year,
    listing.taxonomy?.semester ? `Semester ${listing.taxonomy.semester}` : null,
    listing.taxonomy?.branch,
    studyMetadata.examFocus,
    studyMetadata.questionType,
    studyMetadata.difficultyLevel,
  ].filter(Boolean);

  return (
    <article className={`marketplace-card premium-marketplace-card ${sellerView ? "seller-view" : "buyer-view"}`}>
      <div className="marketplace-card-topline">
        <StatusBadge tone={sourceTone}>{sourceLabel}</StatusBadge>
        <div className="marketplace-card-price">
          <span>Price</span>
          <strong>Rs. {listing.priceInr}</strong>
        </div>
      </div>

      <div className="marketplace-card-showcase">
        <div className="marketplace-card-icon" aria-hidden="true">
          {iconSeed}
        </div>
        <div className="marketplace-card-copy">
          <p className="eyebrow">{subjectLabel}</p>
          <h3>{listing.title}</h3>
          <p className="support-copy">{academicSummary || "Structured academic taxonomy"}</p>
        </div>
      </div>

      <p className="support-copy">{listing.description || "Compact exam-ready notes prepared for public marketplace discovery."}</p>

      <div className="marketplace-taxonomy">
        {studyTags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      <div className="marketplace-card-meta-grid">
        <div className="marketplace-card-meta-cell">
          <span className="info-label">Seller</span>
          <strong>{sellerLabel}</strong>
        </div>
        <div className="marketplace-card-meta-cell">
          <span className="info-label">{sellerView ? "Listing state" : "Source"}</span>
          <strong>{sellerView ? (listing.isPublished ? "Published" : "Draft or unlisted") : sourceDescription}</strong>
        </div>
        <div className="marketplace-card-meta-cell">
          <span className="info-label">{sellerView ? "Views" : "Buyer flow"}</span>
          <strong>{sellerView ? listing.viewCount || 0 : "Review then pay securely"}</strong>
        </div>
        <div className="marketplace-card-meta-cell">
          <span className="info-label">{sellerView ? "Sales" : "Access"}</span>
          <strong>{sellerView ? listing.salesCount || 0 : "Secure PDF download"}</strong>
        </div>
      </div>

      <div className="marketplace-card-footer">
        {sellerView ? (
          <StatusBadge tone={listing.isPublished ? "success" : "warning"}>
            {listing.visibility}
          </StatusBadge>
        ) : (
          <p className="support-copy">Open the listing to review details, trust signals, and checkout options.</p>
        )}

        <div className="hero-actions card-actions">
          <Link className={sellerView ? "button secondary" : "button primary"} to={`/pdf/${listing.slug}`}>
            <i className="bi bi-arrow-up-right" />
            {sellerView ? "View detail" : "Review PDF"}
          </Link>
          {action}
        </div>
      </div>
    </article>
  );
}
