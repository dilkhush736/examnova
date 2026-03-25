import { useEffect, useState } from "react";
import { EmptyStateCard } from "../../components/ui/EmptyStateCard.jsx";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { downloadLibraryItem, fetchLibrary } from "../../services/api/index.js";

export function PurchasedPdfsPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadLibrary() {
      setIsLoading(true);
      try {
        const response = await fetchLibrary(accessToken);
        if (active) {
          setItems(response.data.items);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || "Unable to load your purchased library.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    if (accessToken) {
      loadLibrary();
    }

    return () => {
      active = false;
    };
  }, [accessToken]);

  async function handleDownload(purchaseId, title) {
    try {
      const response = await downloadLibraryItem(accessToken, purchaseId);
      const blobUrl = window.URL.createObjectURL(response.blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `${title || "marketplace-pdf"}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (requestError) {
      setError(requestError.message || "Unable to download purchased PDF.");
    }
  }

  return (
    <section className="stack-section">
      <SectionHeader
        eyebrow="Library"
        title="Purchased PDFs"
        description="Your paid marketplace PDFs stay here permanently with re-download access and academic metadata."
      />
      {error ? <p className="form-error">{error}</p> : null}
      {isLoading ? (
        <LoadingCard message="Loading purchased PDFs..." />
      ) : items.length ? (
        <div className="marketplace-grid">
          {items.map((item) => (
            <article className="marketplace-card" key={item.id}>
              <div className="marketplace-card-header">
                <div>
                  <p className="eyebrow">{item.taxonomy?.subject || "Purchased PDF"}</p>
                  <h3>{item.title}</h3>
                  <p className="support-copy">
                    Bought on {new Date(item.purchasedAt).toLocaleDateString()} - Seller: {item.sellerName}
                  </p>
                </div>
                <div className="topbar-chip-group">
                  <span className="status-chip">Rs. {item.amountInr}</span>
                  <span className="status-chip muted">{item.buyerAccessState}</span>
                </div>
              </div>
              <div className="marketplace-taxonomy">
                <span>{item.taxonomy?.university}</span>
                <span>{item.taxonomy?.branch}</span>
                <span>{item.taxonomy?.semester}</span>
                <span>{item.taxonomy?.subject}</span>
              </div>
              <div className="hero-actions">
                <button className="button primary" onClick={() => handleDownload(item.id, item.title)} type="button">
                  Download PDF
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyStateCard
          title="No purchases yet"
          description="When you buy exam-ready PDFs from the marketplace, they will appear here for permanent re-download."
        />
      )}
    </section>
  );
}
