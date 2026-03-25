import { Link } from "react-router-dom";
import { StatusBadge } from "./StatusBadge.jsx";

function getTone(parsingStatus) {
  if (parsingStatus === "completed") {
    return "success";
  }
  if (parsingStatus === "failed") {
    return "danger";
  }
  if (parsingStatus === "processing" || parsingStatus === "pending") {
    return "warning";
  }
  return "neutral";
}

export function DocumentCard({ document, onDelete, onRetry }) {
  return (
    <article className="document-card">
      <div className="document-card-header">
        <div>
          <p className="eyebrow">{document.sourceCategory || "Study material"}</p>
          <h3>{document.documentTitle || document.originalName}</h3>
          <p className="support-copy">
            {document.mimeType} - {new Date(document.createdAt).toLocaleString()}
          </p>
        </div>
        <StatusBadge tone={getTone(document.parsingStatus)}>{document.parsingStatus}</StatusBadge>
      </div>
      <p className="support-copy">{document.extractedTextPreview || "No extracted text preview available yet."}</p>
      <div className="document-meta-row">
        <span>{Math.ceil((document.sizeInBytes || 0) / 1024)} KB</span>
        <span>{document.sourceCategory}</span>
      </div>
      <div className="hero-actions">
        <Link className="button secondary" to={`/app/documents/${document.id}`}>
          View details
        </Link>
        <Link className="button secondary" to={`/app/documents/${document.id}/questions`}>
          Detect questions
        </Link>
        <button className="button ghost" onClick={() => onRetry(document.id)} type="button">
          Retry parsing
        </button>
        <button className="button ghost danger" onClick={() => onDelete(document.id)} type="button">
          Archive
        </button>
      </div>
    </article>
  );
}
