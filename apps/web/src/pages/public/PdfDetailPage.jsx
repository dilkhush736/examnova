import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { EmptyStateCard } from "../../components/ui/EmptyStateCard.jsx";
import { InternalLinkGrid } from "../../components/ui/InternalLinkGrid.jsx";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { MarketplaceListingCard } from "../../components/ui/MarketplaceListingCard.jsx";
import { PageHero } from "../../components/ui/PageHero.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { SeoHead } from "../../seo/SeoHead.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
  createMarketplaceOrder,
  createPublicMarketplaceOrder,
  downloadGuestLibraryItem,
  fetchPublicListingDetail,
  verifyMarketplacePayment,
  verifyPublicMarketplacePayment,
} from "../../services/api/index.js";
import { loadRazorpayCheckout } from "../../utils/loadRazorpayCheckout.js";
import {
  buildBreadcrumbSchema,
  buildProductSchema,
  buildSeoPayload,
} from "../../utils/seo.js";

function createTaxonomyLink(prefix, value) {
  if (!value) {
    return null;
  }

  return {
    label: value,
    href: `/${prefix}/${value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
  };
}

const DEFAULT_FEEDBACK = {
  type: "",
  message: "",
  detail: "",
  showLibraryAction: false,
  showGuestDownload: false,
};

function normalizeGuestName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function getGuestPurchaseStorageKey(listingId) {
  return `examnova:guest-marketplace-access:${listingId}`;
}

function readGuestPurchaseAccess(listingId) {
  if (typeof window === "undefined" || !listingId) {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(getGuestPurchaseStorageKey(listingId));
    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);
    if (!parsedValue?.purchaseId || !parsedValue?.token) {
      window.sessionStorage.removeItem(getGuestPurchaseStorageKey(listingId));
      return null;
    }

    if (parsedValue.expiresAt && new Date(parsedValue.expiresAt).getTime() <= Date.now()) {
      window.sessionStorage.removeItem(getGuestPurchaseStorageKey(listingId));
      return null;
    }

    return parsedValue;
  } catch {
    window.sessionStorage.removeItem(getGuestPurchaseStorageKey(listingId));
    return null;
  }
}

function storeGuestPurchaseAccess(listingId, access) {
  if (typeof window === "undefined" || !listingId || !access?.purchaseId || !access?.token) {
    return;
  }

  window.sessionStorage.setItem(getGuestPurchaseStorageKey(listingId), JSON.stringify(access));
}

function clearGuestPurchaseAccess(listingId) {
  if (typeof window === "undefined" || !listingId) {
    return;
  }

  window.sessionStorage.removeItem(getGuestPurchaseStorageKey(listingId));
}

function triggerBlobDownload(blob, title) {
  const blobUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = `${title || "marketplace-pdf"}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export function PdfDetailPage() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { accessToken, isAuthenticated } = useAuth();
  const [state, setState] = useState({ listing: null, relatedListings: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isGuestDownloading, setIsGuestDownloading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(DEFAULT_FEEDBACK);
  const [guestFullName, setGuestFullName] = useState("");
  const [guestAccess, setGuestAccess] = useState(null);
  const autoPurchaseAttemptedRef = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadListing() {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetchPublicListingDetail(slug);
        if (active) {
          setState(response.data);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || "Unable to load marketplace listing.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    if (slug) {
      loadListing();
    }

    return () => {
      active = false;
    };
  }, [slug]);

  const listing = state.listing;
  const universityLink = createTaxonomyLink("university", listing?.taxonomy?.university);
  const branchLink = createTaxonomyLink("branch", listing?.taxonomy?.branch);
  const semesterLink = createTaxonomyLink("semester", listing?.taxonomy?.semester);
  const subjectLink = createTaxonomyLink("subject", listing?.taxonomy?.subject);
  const examPreparationLink = createTaxonomyLink("exam-preparation", listing?.taxonomy?.subject);
  const importantQuestionsLink = createTaxonomyLink("important-questions", listing?.taxonomy?.subject);
  const sourceLabel = listing?.sellerSourceLabel || "Marketplace Seller";
  const seoPayload = listing
    ? buildSeoPayload({
        title: listing.seoTitle || listing.title,
        description:
          listing.seoDescription ||
          listing.description ||
          "Compact exam-ready PDF listing with structured academic categorization.",
        pathname: `/pdf/${listing.slug}`,
        type: "product",
        jsonLd: [
          buildProductSchema({
            title: listing.title,
            description: listing.description,
            pathname: `/pdf/${listing.slug}`,
            priceInr: listing.priceInr,
            sellerName: listing.sellerName,
          }),
          buildBreadcrumbSchema([
            { label: "Home", href: "/" },
            { label: "Marketplace", href: "/marketplace" },
            { label: listing.title, href: `/pdf/${listing.slug}` },
          ]),
        ],
      })
    : null;

  useEffect(() => {
    if (!listing?.id) {
      return;
    }

    const storedGuestAccess = readGuestPurchaseAccess(listing.id);
    setGuestAccess(storedGuestAccess);

    if (storedGuestAccess?.buyerName) {
      setGuestFullName(storedGuestAccess.buyerName);
    }

    if (storedGuestAccess && !feedback.message) {
      setFeedback({
        type: "success",
        message: `Your guest purchase for "${listing.title}" is still active in this tab.`,
        detail: storedGuestAccess.expiresAt
          ? `Secure re-download access remains available until ${new Date(storedGuestAccess.expiresAt).toLocaleString()}.`
          : "",
        showLibraryAction: false,
        showGuestDownload: true,
      });
    }
  }, [listing?.id, listing?.title]);

  useEffect(() => {
    if (
      !searchParams.get("buy") ||
      !isAuthenticated ||
      !accessToken ||
      !listing?.id ||
      isLoading ||
      autoPurchaseAttemptedRef.current
    ) {
      return;
    }

    autoPurchaseAttemptedRef.current = true;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("buy");
    setSearchParams(nextParams, { replace: true });
    handlePurchase();
  }, [accessToken, isAuthenticated, isLoading, listing?.id, searchParams, setSearchParams]);

  async function handleGuestDownload(access = guestAccess, { silent = false } = {}) {
    if (!access?.purchaseId || !access?.token) {
      if (!silent) {
        setFeedback({
          ...DEFAULT_FEEDBACK,
          type: "error",
          message: "Secure guest download is not ready yet.",
        });
      }
      return;
    }

    setIsGuestDownloading(true);

    try {
      const response = await downloadGuestLibraryItem(access.purchaseId, access.token);
      triggerBlobDownload(response.blob, listing?.title);
    } catch (requestError) {
      if (requestError.status === 401 || requestError.status === 403) {
        clearGuestPurchaseAccess(listing?.id);
        setGuestAccess(null);
      }

      if (!silent) {
        setFeedback({
          type: "error",
          message: requestError.message || "Unable to download your purchased PDF.",
          detail: "If payment already succeeded, restart checkout on this page to generate a fresh secure download token.",
          showLibraryAction: false,
          showGuestDownload: false,
        });
      }

      throw requestError;
    } finally {
      setIsGuestDownloading(false);
    }
  }

  async function handleAuthenticatedPurchase() {
    if (!accessToken) {
      throw new Error("Your session is still loading. Please try again in a moment.");
    }

    const [RazorpayCheckout, orderResponse] = await Promise.all([
      loadRazorpayCheckout(),
      createMarketplaceOrder(accessToken, listing.id),
    ]);

    if (orderResponse.data.alreadyOwned) {
      setFeedback({
        type: "success",
        message: "You already own this PDF. Open your purchased library to download it again.",
        detail: "",
        showLibraryAction: true,
        showGuestDownload: false,
      });
      return;
    }

    const checkout = orderResponse.data?.checkout;
    if (!checkout?.orderId || !checkout?.key) {
      throw new Error("Payment checkout is not available right now. Please try again in a moment.");
    }

    await new Promise((resolve, reject) => {
      const razorpay = new RazorpayCheckout({
        key: checkout.key,
        amount: checkout.amount,
        currency: checkout.currency,
        name: checkout.name,
        description: checkout.description,
        order_id: checkout.orderId,
        notes: checkout.notes,
        theme: { color: "#cc6f29" },
        modal: {
          ondismiss: () => reject(new Error("Payment was cancelled before completion.")),
        },
        handler: async (response) => {
          try {
            await verifyMarketplacePayment(accessToken, {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            });
            navigate("/app/purchased-pdfs", {
              replace: true,
              state: {
                message: `Purchase completed successfully. "${listing.title}" is now available in your library.`,
              },
            });
            resolve();
          } catch (requestError) {
            reject(requestError);
          }
        },
      });

      razorpay.open();
    });
  }

  async function handlePublicPurchase() {
    const normalizedGuestName = normalizeGuestName(guestFullName);
    if (!normalizedGuestName) {
      throw new Error("Enter your full name before starting secure checkout.");
    }

    const [RazorpayCheckout, orderResponse] = await Promise.all([
      loadRazorpayCheckout(),
      createPublicMarketplaceOrder(listing.id, normalizedGuestName),
    ]);

    const checkout = orderResponse.data?.checkout;
    if (!checkout?.orderId || !checkout?.key) {
      throw new Error("Payment checkout is not available right now. Please try again in a moment.");
    }

    const nextGuestAccess = await new Promise((resolve, reject) => {
      const razorpay = new RazorpayCheckout({
        key: checkout.key,
        amount: checkout.amount,
        currency: checkout.currency,
        name: checkout.name,
        description: checkout.description,
        order_id: checkout.orderId,
        notes: checkout.notes,
        prefill: checkout.prefill || { name: normalizedGuestName },
        theme: { color: "#cc6f29" },
        modal: {
          ondismiss: () => reject(new Error("Payment was cancelled before completion.")),
        },
        handler: async (response) => {
          try {
            const verificationResponse = await verifyPublicMarketplacePayment({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            });
            const verifiedGuestAccess = verificationResponse.data?.guestAccess;
            if (!verifiedGuestAccess?.purchaseId || !verifiedGuestAccess?.token) {
              throw new Error("Payment succeeded, but secure download access could not be prepared.");
            }
            resolve({
              ...verifiedGuestAccess,
              buyerName: normalizedGuestName,
            });
          } catch (requestError) {
            reject(requestError);
          }
        },
      });

      razorpay.open();
    });

    storeGuestPurchaseAccess(listing.id, nextGuestAccess);
    setGuestAccess(nextGuestAccess);
    setGuestFullName(normalizedGuestName);
    setFeedback({
      type: "success",
      message: `Payment successful. "${listing.title}" is now ready to download securely.`,
      detail: nextGuestAccess.expiresAt
        ? `Secure guest access is active in this tab until ${new Date(nextGuestAccess.expiresAt).toLocaleString()}.`
        : "Use the secure download button below if the file does not start automatically.",
      showLibraryAction: false,
      showGuestDownload: true,
    });

    try {
      await handleGuestDownload(nextGuestAccess, { silent: true });
    } catch {
      setFeedback({
        type: "success",
        message: `Payment successful. "${listing.title}" is unlocked, but auto-download did not start.`,
        detail: nextGuestAccess.expiresAt
          ? `Use the secure download button below. This guest access stays active until ${new Date(nextGuestAccess.expiresAt).toLocaleString()}.`
          : "Use the secure download button below.",
        showLibraryAction: false,
        showGuestDownload: true,
      });
    }
  }

  async function handlePurchase() {
    if (!listing?.id) {
      return;
    }

    setFeedback(DEFAULT_FEEDBACK);
    setIsPurchasing(true);

    try {
      if (isAuthenticated) {
        await handleAuthenticatedPurchase();
      } else {
        await handlePublicPurchase();
      }
    } catch (requestError) {
      setFeedback({
        type: "error",
        message: requestError.message || "Unable to complete marketplace purchase.",
        detail: "",
        showLibraryAction: false,
        showGuestDownload: false,
      });
    } finally {
      setIsPurchasing(false);
    }
  }

  return (
    <>
      {seoPayload ? <SeoHead {...seoPayload} /> : null}
      {isLoading ? (
        <LoadingCard message="Loading marketplace PDF detail..." />
      ) : error ? (
        <EmptyStateCard title="Listing unavailable" description={error} />
      ) : (
        <>
          <PageHero
            eyebrow={listing?.taxonomy?.subject || "PDF detail"}
            title={listing?.title || slug || "Listing"}
            description={listing?.description || "Compact exam-ready PDF listing for focused revision."}
            metrics={[
              { label: "Price", value: `Rs. ${listing?.priceInr || 0}` },
              { label: "Views", value: `${listing?.viewCount || 0}` },
              { label: "Access", value: isAuthenticated ? "Permanent library" : "Verified download" },
            ]}
            actions={
              <>
                <button className="button primary" disabled={isPurchasing} onClick={handlePurchase} type="button">
                  <i className="bi bi-bag-check" />
                  {isPurchasing
                    ? "Opening checkout..."
                    : `Buy for Rs. ${listing?.priceInr || 0}`}
                </button>
                <Link className="button secondary" to="/marketplace"><i className="bi bi-arrow-left" />Back to marketplace</Link>
              </>
            }
          />
          {feedback.message ? (
            <div className="stack-section">
              <p className={feedback.type === "error" ? "form-error" : "form-success"}>{feedback.message}</p>
              {feedback.detail ? <p className="support-copy marketplace-purchase-feedback-detail">{feedback.detail}</p> : null}
              {feedback.showLibraryAction ? (
                <div className="hero-actions">
                  <Link className="button ghost" to="/app/purchased-pdfs">
                    <i className="bi bi-collection" />
                    Open purchased library
                  </Link>
                </div>
              ) : null}
              {feedback.showGuestDownload && guestAccess ? (
                <div className="hero-actions">
                  <button className="button ghost" disabled={isGuestDownloading} onClick={() => handleGuestDownload()} type="button">
                    <i className="bi bi-download" />
                    {isGuestDownloading ? "Preparing download..." : "Secure download PDF"}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
          <section className="two-column-grid marketplace-purchase-shell">
            <article className="detail-card marketplace-checkout-card">
              <SectionHeader
                eyebrow={isAuthenticated ? "Account checkout" : "Guest checkout"}
                title={isAuthenticated ? "Buy with your ExamNova account" : "Buy without signup"}
                description={
                  isAuthenticated
                    ? "Complete secure checkout and this PDF will be added to your purchased library."
                    : "Enter your full name, pay securely, and download this marketplace PDF right after verification."
                }
              />
              {!isAuthenticated ? (
                <label className="field">
                  <span>Full name</span>
                  <input
                    className="input"
                    type="text"
                    value={guestFullName}
                    onChange={(event) => setGuestFullName(event.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    disabled={isPurchasing}
                  />
                </label>
              ) : (
                <div className="marketplace-taxonomy">
                  <span>Signed-in purchase</span>
                  <span>Library access after payment</span>
                  <span>Re-download anytime</span>
                </div>
              )}
              <p className="support-copy">
                {isAuthenticated
                  ? "Your secure payment is verified server-side before the PDF is added to your library."
                  : "Guest checkout asks only for your full name here. Payment happens inside Razorpay's secure checkout and the download opens only after backend verification."}
              </p>
              <div className="hero-actions">
                <button className="button primary" disabled={isPurchasing} onClick={handlePurchase} type="button">
                  <i className="bi bi-shield-lock" />
                  {isPurchasing
                    ? "Opening checkout..."
                    : isAuthenticated
                      ? `Buy for Rs. ${listing?.priceInr || 0}`
                      : `Secure guest checkout for Rs. ${listing?.priceInr || 0}`}
                </button>
                {!isAuthenticated ? (
                  <Link
                    className="button ghost"
                    to="/login"
                    state={{
                      from: {
                        pathname: location.pathname,
                        search: location.search,
                      },
                    }}
                  >
                    <i className="bi bi-person-badge" />
                    Login for library access
                  </Link>
                ) : (
                  <Link className="button ghost" to="/app/purchased-pdfs">
                    <i className="bi bi-collection" />
                    Open purchased library
                  </Link>
                )}
              </div>
            </article>
            <article className="detail-card marketplace-checkout-note">
              <SectionHeader
                eyebrow="Trust and delivery"
                title="What happens after payment"
                description="The file is never exposed directly. Download access is created only after successful Razorpay verification."
              />
              <div className="marketplace-taxonomy">
                <StatusBadge tone="warning">{sourceLabel}</StatusBadge>
                <span>Secure Razorpay payment</span>
                <span>Server-side verification</span>
                <span>{isAuthenticated ? "Account library access" : "Guest secure download"}</span>
              </div>
              <p className="support-copy">
                Sold by {listing?.sellerName || "ExamNova Seller"} through the public marketplace. This flow is designed so first-time buyers can complete a purchase without confusion.
              </p>
              {!isAuthenticated ? (
                <p className="support-copy">
                  If you prefer permanent account-based access, you can still login first. Otherwise, guest checkout will work with only your full name and payment.
                </p>
              ) : null}
            </article>
          </section>
          <section className="two-column-grid">
            <article className="detail-card">
              <div className="section-header">
                <div>
                  <p className="eyebrow">Academic fit</p>
                  <h2>Structured category context</h2>
                </div>
              </div>
              <div className="info-grid">
                <div><span className="info-label">University</span><strong>{listing?.taxonomy?.university}</strong></div>
                <div><span className="info-label">Branch</span><strong>{listing?.taxonomy?.branch}</strong></div>
                <div><span className="info-label">Year</span><strong>{listing?.taxonomy?.year}</strong></div>
                <div><span className="info-label">Semester</span><strong>{listing?.taxonomy?.semester ? `Semester ${listing.taxonomy.semester}` : "-"}</strong></div>
                <div><span className="info-label">Subject</span><strong>{listing?.taxonomy?.subject}</strong></div>
                <div><span className="info-label">Price</span><strong>Rs. {listing?.priceInr}</strong></div>
                <div><span className="info-label">Exam focus</span><strong>{listing?.studyMetadata?.examFocus || "-"}</strong></div>
                <div><span className="info-label">Question type</span><strong>{listing?.studyMetadata?.questionType || "-"}</strong></div>
                <div><span className="info-label">Difficulty</span><strong>{listing?.studyMetadata?.difficultyLevel || "-"}</strong></div>
                <div><span className="info-label">Audience</span><strong>{listing?.studyMetadata?.intendedAudience || "-"}</strong></div>
              </div>
              <div className="marketplace-taxonomy">
                {universityLink ? <Link to={universityLink.href}>{universityLink.label}</Link> : null}
                {branchLink ? <Link to={branchLink.href}>{branchLink.label}</Link> : null}
                {semesterLink ? <Link to={semesterLink.href}>{semesterLink.label}</Link> : null}
                {subjectLink ? <Link to={subjectLink.href}>{subjectLink.label}</Link> : null}
              </div>
              <p className="support-copy">
                Sold by {listing?.sellerName || "ExamNova Seller"} ({listing?.sellerSourceLabel || "Seller"}) - {listing?.viewCount || 0} views - {isAuthenticated ? "Permanent buyer-library access after purchase." : "Secure guest download after successful payment verification."}
              </p>
            </article>
            <article className="detail-card">
              <div className="section-header">
                <div>
                  <p className="eyebrow">Why this PDF</p>
                  <h2>What a first-time buyer should know</h2>
                </div>
              </div>
              <p className="support-copy">{listing?.description}</p>
              <div className="marketplace-taxonomy">
                {listing?.studyMetadata?.examFocus ? <span>{listing.studyMetadata.examFocus}</span> : null}
                {listing?.studyMetadata?.questionType ? <span>{listing.studyMetadata.questionType}</span> : null}
                {listing?.studyMetadata?.difficultyLevel ? <span>{listing.studyMetadata.difficultyLevel}</span> : null}
                {listing?.studyMetadata?.intendedAudience ? <span>{listing.studyMetadata.intendedAudience}</span> : null}
                {(listing?.tags || []).map((tag) => <span key={tag}>{tag}</span>)}
                {!(listing?.tags || []).length && !listing?.studyMetadata?.examFocus ? <span>Focused revision</span> : null}
              </div>
              <p className="support-copy">
                Purchase takes you through a secure payment step, then the PDF is unlocked either in your account library or through a verified guest download token.
              </p>
              <div className="hero-actions">
                <Link className="button ghost" to={examPreparationLink?.href || "/marketplace"}>
                  Explore exam preparation
                </Link>
                <Link className="button ghost" to={importantQuestionsLink?.href || "/marketplace"}>
                  Important questions
                </Link>
              </div>
            </article>
          </section>
          <section className="three-column-grid">
            <InternalLinkGrid
              links={universityLink ? [universityLink] : []}
              title="University preparation"
            />
            <InternalLinkGrid
              links={branchLink ? [branchLink] : []}
              title="Branch preparation"
            />
            <InternalLinkGrid
              links={semesterLink ? [semesterLink] : []}
              title="Semester preparation"
            />
            <InternalLinkGrid
              links={subjectLink ? [subjectLink] : []}
              title="Subject discovery"
            />
            <InternalLinkGrid
              links={examPreparationLink ? [examPreparationLink] : []}
              title="Exam preparation"
            />
            <InternalLinkGrid
              links={importantQuestionsLink ? [importantQuestionsLink] : []}
              title="Important questions"
            />
          </section>
          <section className="stack-section">
            <div className="section-header">
              <div>
                <p className="eyebrow">Related PDFs</p>
                <h2>More from this subject</h2>
              </div>
            </div>
            {state.relatedListings.length ? (
              <div className="marketplace-grid">
                {state.relatedListings.map((item) => (
                  <MarketplaceListingCard key={item.id} listing={item} />
                ))}
              </div>
            ) : (
              <EmptyStateCard
                title="No related PDFs yet"
                description="As more PDFs are published for this subject, related marketplace recommendations will appear here."
              />
            )}
          </section>
        </>
      )}
    </>
  );
}
