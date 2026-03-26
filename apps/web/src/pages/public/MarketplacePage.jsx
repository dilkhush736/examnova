import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyStateCard } from "../../components/ui/EmptyStateCard.jsx";
import { InternalLinkGrid } from "../../components/ui/InternalLinkGrid.jsx";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { MarketplaceListingCard } from "../../components/ui/MarketplaceListingCard.jsx";
import { PageHero } from "../../components/ui/PageHero.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { UpcomingLockedCard } from "../../components/ui/UpcomingLockedCard.jsx";
import {
  BRANCH_OPTIONS,
  DEFAULT_UNIVERSITY,
  SEMESTER_OPTIONS,
  YEAR_OPTIONS,
  withAllOption,
} from "../../features/academic/academicTaxonomy.js";
import { useAuth } from "../../hooks/useAuth.js";
import { SeoHead } from "../../seo/SeoHead.jsx";
import {
  fetchPublicListings,
  fetchSeoDiscoveryIndex,
  fetchUpcomingLockedPdfs,
} from "../../services/api/index.js";
import { buildBreadcrumbSchema, buildCollectionSchema, buildSeoPayload } from "../../utils/seo.js";
import {
  MODE_CATALOG,
  MODE_LABELS,
  normalizeModeAccess,
  PLATFORM_MODES,
} from "../../utils/modes.js";

const DEFAULT_FILTERS = {
  search: "",
  university: "",
  branch: "",
  year: "",
  semester: "",
  subject: "",
  sort: "latest",
};

export function MarketplacePage() {
  const { isAuthenticated, user } = useAuth();
  const universityOptions = withAllOption([DEFAULT_UNIVERSITY], "All universities");
  const branchOptions = withAllOption(BRANCH_OPTIONS, "All branches");
  const yearOptions = withAllOption(YEAR_OPTIONS, "All years");
  const semesterOptions = withAllOption(SEMESTER_OPTIONS, "All semesters");

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [result, setResult] = useState({ items: [], pagination: null });
  const [upcomingItems, setUpcomingItems] = useState([]);
  const [discoveryIndex, setDiscoveryIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadListings() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetchPublicListings(filters);
        if (active) {
          setResult(response.data);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message || "Unable to load marketplace listings.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadListings();

    return () => {
      active = false;
    };
  }, [filters]);

  useEffect(() => {
    let active = true;

    async function loadUpcoming() {
      try {
        const response = await fetchUpcomingLockedPdfs({
          semester: filters.semester,
          subject: filters.subject,
        });
        if (active) {
          setUpcomingItems(response.data.items.slice(0, 3));
        }
      } catch {
        if (active) {
          setUpcomingItems([]);
        }
      }
    }

    loadUpcoming();

    return () => {
      active = false;
    };
  }, [filters.semester, filters.subject]);

  useEffect(() => {
    let active = true;

    async function loadDiscoveryIndex() {
      try {
        const response = await fetchSeoDiscoveryIndex();
        if (active) {
          setDiscoveryIndex(response.data);
        }
      } catch {
        if (active) {
          setDiscoveryIndex(null);
        }
      }
    }

    loadDiscoveryIndex();

    return () => {
      active = false;
    };
  }, []);

  function handleFilterChange(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleResetFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  const totalListings = result.pagination?.total || result.items.length;
  const officialListings = result.items.filter((listing) => listing.sourceType === "admin_upload");
  const studentListings = result.items.filter((listing) => listing.sourceType !== "admin_upload");
  const hasActiveFilters = Object.entries(filters).some(([key, value]) =>
    key === "sort" ? value !== DEFAULT_FILTERS.sort : Boolean(value),
  );
  const visibleOfficialCount = isLoading ? "Loading..." : `${officialListings.length} visible on this page`;
  const visibleStudentCount = isLoading ? "Loading..." : `${studentListings.length} visible on this page`;
  const modeAccess = normalizeModeAccess(user);
  const isDeveloperMode = modeAccess.currentMode === PLATFORM_MODES.DEVELOPER;
  const primaryWorkspaceHref = isAuthenticated
    ? isDeveloperMode
      ? "/app/listed-pdfs"
      : "/app/upload-generate"
    : "/signup";
  const primaryWorkspaceLabel = isAuthenticated
    ? isDeveloperMode
      ? "Open Developer Mode"
      : "Open Professional Mode"
    : "Create account";

  const seoPayload = buildSeoPayload({
    title: "Marketplace",
    description: "Browse university, branch, semester, and subject-based exam PDFs on ExamNova AI.",
    pathname: "/marketplace",
    jsonLd: [
      buildCollectionSchema({
        title: "Marketplace",
        description: "Public marketplace for university, semester, branch, and subject-based exam PDFs.",
        pathname: "/marketplace",
      }),
      buildBreadcrumbSchema([
        { label: "Home", href: "/" },
        { label: "Marketplace", href: "/marketplace" },
      ]),
    ],
  });

  return (
    <>
      <SeoHead {...seoPayload} />
      <PageHero
        eyebrow="Premium study marketplace"
        title="Find exam-ready PDFs in a clean, trusted marketplace."
        description="Browse official ExamNova uploads and student-sold PDFs through a clearer grid, stronger academic filters, and secure checkout that still works for first-time visitors without forcing signup first."
        metrics={[
          { label: "Catalog", value: isLoading ? "Loading..." : `${totalListings} listings` },
          { label: "Official", value: visibleOfficialCount },
          { label: "Student sellers", value: visibleStudentCount },
        ]}
        actions={
          <>
            <Link className="button primary" to={primaryWorkspaceHref}>
              <i className={`bi ${isAuthenticated ? (isDeveloperMode ? "bi-lightning-charge-fill" : "bi-cloud-arrow-up") : "bi-person-plus-fill"}`} />
              {primaryWorkspaceLabel}
            </Link>
            <Link className="button secondary" to="/upcoming">
              <i className="bi bi-hourglass-split" />
              See upcoming releases
            </Link>
            <Link className="button ghost" to={isAuthenticated ? "/app/settings#mode-access" : "/login"}>
              <i className={`bi ${isAuthenticated ? "bi-stars" : "bi-box-arrow-in-right"}`} />
              {isAuthenticated ? `${MODE_LABELS[modeAccess.currentMode]} active` : "Login"}
            </Link>
          </>
        }
      />

      <section className="marketplace-entry-grid">
        <article className="detail-card marketplace-onboarding-card">
          <p className="eyebrow">Quick start</p>
          <h2>What a first-time student should do</h2>
          <p className="support-copy">
            Pick your branch and semester, scan the source badge, then open any card to review the PDF and purchase access with confidence.
          </p>
          <div className="marketplace-step-list">
            <div className="marketplace-step-item">
              <span className="marketplace-step-number">1</span>
              <div>
                <strong>Choose your academic path</strong>
                <p className="support-copy">Use university, branch, year, semester, and subject filters if you already know what you need.</p>
              </div>
            </div>
            <div className="marketplace-step-item">
              <span className="marketplace-step-number">2</span>
              <div>
                <strong>Check the source before opening</strong>
                <p className="support-copy">Every premium product card clearly shows whether the PDF is an ExamNova upload or a student listing.</p>
              </div>
            </div>
            <div className="marketplace-step-item">
              <span className="marketplace-step-number">3</span>
              <div>
                <strong>Buy once and keep access</strong>
                <p className="support-copy">Simple Mode supports guest purchase and secure download, while logged-in users also keep account library access.</p>
              </div>
            </div>
          </div>
        </article>

        <article className="detail-card marketplace-source-card official">
          <p className="eyebrow">Official shelf</p>
          <h2>ExamNova Admin PDFs</h2>
          <p className="support-copy">
            Curated PDFs uploaded by the ExamNova team so students can quickly spot trusted official material in the grid.
          </p>
          <div className="marketplace-source-footer">
            <StatusBadge tone="warning">{visibleOfficialCount}</StatusBadge>
            <p className="support-copy">Look for the ExamNova Admin badge on each card.</p>
          </div>
        </article>

        <article className="detail-card marketplace-source-card community">
          <p className="eyebrow">Community shelf</p>
          <h2>Student seller PDFs</h2>
          <p className="support-copy">
            Published by student sellers who want to share useful exam-ready notes, generated PDFs, and alternate study material.
          </p>
          <div className="marketplace-source-footer">
            <StatusBadge tone="neutral">{visibleStudentCount}</StatusBadge>
            <p className="support-copy">These listings keep the catalog broader and more useful.</p>
          </div>
        </article>
      </section>

      <section className="two-column-grid marketplace-shell">
        <form className="detail-card marketplace-filters">
          <div className="section-header">
            <div>
              <p className="eyebrow">Browse filters</p>
              <h2>Find the right PDF faster</h2>
              <p className="support-copy">
                Start broad if you are new. Most students can narrow the catalog quickly just by choosing branch and semester first.
              </p>
            </div>
            {hasActiveFilters ? (
              <button className="button ghost" onClick={handleResetFilters} type="button">
                <i className="bi bi-arrow-counterclockwise" />
                Reset filters
              </button>
            ) : null}
          </div>
          <p className="support-copy marketplace-filter-helper">
            These filters only affect published marketplace PDFs, so whatever appears below is already ready to open and review.
          </p>
          <label className="field">
            <span>Search PDFs</span>
            <input className="input" onChange={(event) => handleFilterChange("search", event.target.value)} placeholder="Search by subject, topic, or listing title" value={filters.search} />
          </label>
          <div className="two-column-grid compact">
            <label className="field">
              <span>University</span>
              <select className="input" onChange={(event) => handleFilterChange("university", event.target.value)} value={filters.university}>
                {universityOptions.map((option) => (
                  <option key={option.value || "all-university"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Branch</span>
              <select className="input" onChange={(event) => handleFilterChange("branch", event.target.value)} value={filters.branch}>
                {branchOptions.map((option) => (
                  <option key={option.value || "all-branch"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Year</span>
              <select className="input" onChange={(event) => handleFilterChange("year", event.target.value)} value={filters.year}>
                {yearOptions.map((option) => (
                  <option key={option.value || "all-year"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Semester</span>
              <select className="input" onChange={(event) => handleFilterChange("semester", event.target.value)} value={filters.semester}>
                {semesterOptions.map((option) => (
                  <option key={option.value || "all-semester"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="two-column-grid compact">
            <label className="field"><span>Subject</span><input className="input" onChange={(event) => handleFilterChange("subject", event.target.value)} placeholder="Example: Operating Systems" value={filters.subject} /></label>
            <label className="field">
              <span>Sort results</span>
              <select className="input" onChange={(event) => handleFilterChange("sort", event.target.value)} value={filters.sort}>
                <option value="latest">Latest</option>
                <option value="popularity">Popularity</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </label>
          </div>
        </form>

        <section className="stack-section">
          <article className="detail-card marketplace-results-callout">
            <SectionHeader
              eyebrow="Published catalog"
              title={`${totalListings} listing${totalListings === 1 ? "" : "s"} ready to browse`}
              description="Official ExamNova uploads and student-uploaded PDFs are separated below so first-time users know exactly what they are opening."
              action={
                <div className="topbar-chip-group">
                  <StatusBadge tone="warning">{visibleOfficialCount}</StatusBadge>
                  <StatusBadge tone="neutral">{visibleStudentCount}</StatusBadge>
                </div>
              }
            />
          </article>
          {error ? <p className="form-error">{error}</p> : null}
          {isLoading ? (
            <LoadingCard message="Loading marketplace listings..." />
          ) : result.items.length ? (
            <>
              {officialListings.length ? (
                <section className="stack-section marketplace-results-section">
                  <SectionHeader
                    eyebrow="Official uploads"
                    title="ExamNova Admin listings"
                    description="Curated PDFs uploaded by ExamNova for a more guided starting point."
                    action={<StatusBadge tone="warning">{officialListings.length} on this page</StatusBadge>}
                  />
                  <div className="marketplace-grid">
                    {officialListings.map((listing) => (
                      <MarketplaceListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                </section>
              ) : null}

              {studentListings.length ? (
                <section className="stack-section marketplace-results-section">
                  <SectionHeader
                    eyebrow="Student uploads"
                    title="Community seller listings"
                    description="Useful PDFs published by students so you can compare more than one source."
                    action={<StatusBadge tone="neutral">{studentListings.length} on this page</StatusBadge>}
                  />
                  <div className="marketplace-grid">
                    {studentListings.map((listing) => (
                      <MarketplaceListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                </section>
              ) : null}

              {upcomingItems.length ? (
                <section className="stack-section">
                  <SectionHeader
                    eyebrow="Upcoming locked content"
                    title="Current-semester releases coming soon"
                    description="Students can still discover what is about to be released, even before those PDFs become purchasable."
                  />
                  <div className="marketplace-grid">
                    {upcomingItems.map((item) => (
                      <UpcomingLockedCard item={item} key={item.id} />
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : (
            <EmptyStateCard
              title="No marketplace PDFs match these filters yet"
              description={
                hasActiveFilters
                  ? "Try clearing a few filters or broadening your subject search so more published PDFs can appear."
                  : "Published PDFs from ExamNova Admin and student sellers will appear here as soon as they are available."
              }
              action={
                <>
                  {hasActiveFilters ? (
                    <button className="button primary" onClick={handleResetFilters} type="button">
                      <i className="bi bi-arrow-counterclockwise" />
                      Clear filters
                    </button>
                  ) : null}
                  <Link className="button secondary" to="/upcoming">
                    <i className="bi bi-hourglass-split" />
                    Browse upcoming PDFs
                  </Link>
                </>
              }
            />
          )}
        </section>
      </section>

      <section className="stack-section">
        <SectionHeader
          eyebrow="Upgrade paths"
          title="Simple, Professional, and Developer modes"
          description="The marketplace stays public first. Account-only tools unlock progressively after browsing so the product remains understandable on the first visit."
        />
        <div className="mode-grid">
          {MODE_CATALOG.map((mode) => {
            const isCurrent = mode.id === modeAccess.currentMode;
            const isDeveloper = mode.id === PLATFORM_MODES.DEVELOPER;

            return (
              <article
                className={`detail-card mode-card ${isCurrent ? "current" : ""} ${isDeveloper ? "developer" : ""}`}
                key={mode.id}
              >
                <div className="mode-card-header">
                  <div>
                    <p className="eyebrow">{mode.badge}</p>
                    <h3>{mode.label}</h3>
                  </div>
                  {isCurrent ? <span className="status-chip"><i className="bi bi-stars" />Current</span> : null}
                </div>
                <p className="support-copy">{mode.description}</p>
                <div className="mode-feature-list">
                  {mode.features.map((feature) => (
                    <span className="mode-feature-item" key={feature}>
                      <i className="bi bi-check2-circle" />
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="hero-actions">
                  {mode.id === PLATFORM_MODES.SIMPLE ? (
                    <Link className="button ghost" to="/marketplace">
                      <i className="bi bi-shop" />
                      Browse public PDFs
                    </Link>
                  ) : mode.id === PLATFORM_MODES.PROFESSIONAL ? (
                    <Link className="button primary" to={isAuthenticated ? "/app/upload-generate" : "/signup"}>
                      <i className={`bi ${isAuthenticated ? "bi-cloud-arrow-up" : "bi-person-plus-fill"}`} />
                      {isAuthenticated ? "Use AI workflow" : "Login for Professional"}
                    </Link>
                  ) : (
                    <Link className="button primary" to={isAuthenticated ? "/app/settings#mode-access" : "/signup"}>
                      <i className={`bi ${isAuthenticated ? "bi-lightning-charge-fill" : "bi-person-plus-fill"}`} />
                      {isAuthenticated
                        ? modeAccess.developerUnlocked
                          ? "Switch or manage Developer"
                          : `Unlock Developer for Rs. ${modeAccess.developerUnlockAmountInr}`
                        : "Create account to unlock"}
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {discoveryIndex ? (
        <section className="stack-section">
          <SectionHeader
            eyebrow="Browse faster"
            title="Start with your university, branch, semester, or subject"
            description="If you still want structured discovery after scanning the main catalog, these internal routes take you into deeper academic browsing."
          />
          <div className="three-column-grid">
            <InternalLinkGrid links={discoveryIndex.universities || []} title="Universities" />
            <InternalLinkGrid links={discoveryIndex.branches || []} title="Branches" />
            <InternalLinkGrid links={discoveryIndex.semesters || []} title="Semesters" />
            <InternalLinkGrid links={discoveryIndex.subjects || []} title="Subjects" />
            <InternalLinkGrid links={discoveryIndex.examPreparation || []} title="Exam Preparation" />
            <InternalLinkGrid links={discoveryIndex.importantQuestions || []} title="Important Questions" />
          </div>
        </section>
      ) : null}
    </>
  );
}
