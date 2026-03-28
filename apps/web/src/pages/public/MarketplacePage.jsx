import { useEffect, useState } from "react";
import { EmptyStateCard } from "../../components/ui/EmptyStateCard.jsx";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { MarketplaceListingCard } from "../../components/ui/MarketplaceListingCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { ServiceListingCard } from "../../components/ui/ServiceListingCard.jsx";
import {
  BRANCH_OPTIONS,
  DEFAULT_UNIVERSITY,
  SEMESTER_OPTIONS,
  YEAR_OPTIONS,
  withAllOption,
} from "../../features/academic/academicTaxonomy.js";
import {
  MARKETPLACE_CATEGORY_LIMIT,
  SERVICE_CATEGORY_OPTIONS,
} from "../../features/marketplace/marketplace.constants.js";
import { SeoHead } from "../../seo/SeoHead.jsx";
import { fetchPublicListings, fetchPublicServices } from "../../services/api/index.js";
import { buildBreadcrumbSchema, buildCollectionSchema, buildSeoPayload } from "../../utils/seo.js";

const DEFAULT_FILTERS = {
  search: "",
  university: "",
  branch: "",
  year: "",
  semester: "",
  subject: "",
  sort: "latest",
};

const SERVICE_SECTION_DESCRIPTIONS = {
  portfolio_website: "Personal brands, resumes, creators, and agency profile websites.",
  commercial_website: "Business-ready brochure and commercial web presence templates.",
  product_website: "Product showcase websites with launch sections and feature-first layouts.",
  landing_page: "Single-page marketing, campaign, and lead-capture websites.",
  ecommerce_website: "Storefront-style website kits for catalog and online selling flows.",
};

export function MarketplacePage() {
  const universityOptions = withAllOption([DEFAULT_UNIVERSITY], "All universities");
  const branchOptions = withAllOption(BRANCH_OPTIONS, "All branches");
  const yearOptions = withAllOption(YEAR_OPTIONS, "All years");
  const semesterOptions = withAllOption(SEMESTER_OPTIONS, "All semesters");

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [result, setResult] = useState({
    items: [],
    categoryGroups: {},
    notesItems: [],
    upcomingItems: [],
    pagination: null,
  });
  const [services, setServices] = useState([]);
  const [isListingLoading, setIsListingLoading] = useState(true);
  const [isServiceLoading, setIsServiceLoading] = useState(true);
  const [listingError, setListingError] = useState("");
  const [serviceError, setServiceError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadListings() {
      setIsListingLoading(true);
      setListingError("");

      try {
        const response = await fetchPublicListings(filters);
        if (active) {
          setResult(response.data);
        }
      } catch (requestError) {
        if (active) {
          setListingError(requestError.message || "Unable to load marketplace listings.");
        }
      } finally {
        if (active) {
          setIsListingLoading(false);
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

    async function loadServices() {
      setIsServiceLoading(true);
      setServiceError("");

      try {
        const response = await fetchPublicServices({ search: filters.search });
        if (active) {
          setServices(response.data.items || []);
        }
      } catch (requestError) {
        if (active) {
          setServiceError(requestError.message || "Unable to load website services.");
        }
      } finally {
        if (active) {
          setIsServiceLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      active = false;
    };
  }, [filters.search]);

  function handleFilterChange(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleResetFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  const totalLiveListings = result.pagination?.total || result.items.length;
  const upcomingCount = result.upcomingItems?.length || 0;
  const totalListings = totalLiveListings + upcomingCount;
  const categoryGroups = result.categoryGroups || {};
  const semesterExamItems = categoryGroups.semesterExam || [];
  const ciaExamItems = categoryGroups.ciaExam || [];
  const notesItems = result.notesItems || [];
  const serviceSections = SERVICE_CATEGORY_OPTIONS
    .map((option) => ({
      ...option,
      items: services.filter((item) => item.category === option.value),
    }))
    .filter((section) => section.items.length > 0);
  const hasExamItems = semesterExamItems.length || ciaExamItems.length;
  const hasNoteItems = notesItems.length;
  const hasServiceItems = services.length > 0;
  const hasActiveFilters = Object.entries(filters).some(([key, value]) =>
    key === "sort" ? value !== DEFAULT_FILTERS.sort : Boolean(value),
  );

  const seoPayload = buildSeoPayload({
    title: "Marketplace",
    description: "Browse exam PDFs, notes, and ready-made website services on ExamNova AI.",
    pathname: "/marketplace",
    jsonLd: [
      buildCollectionSchema({
        title: "Marketplace",
        description: "Public marketplace for exam PDFs, notes, and ready-made website services.",
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

      <section className="stack-section simple-marketplace-page">
        <div className="simple-marketplace-header compact">
          <p className="eyebrow">Marketplace</p>
          <h1>Exams, notes, and website services</h1>
          <p className="support-copy">
            Browse semester and CIA exam PDFs, discover notes, and purchase ready-made website service packages from one clean marketplace.
          </p>
        </div>

        <form className="detail-card simple-marketplace-toolbar" onSubmit={(event) => event.preventDefault()}>
          <div className="simple-marketplace-toolbar-head compact">
            <div>
              <p className="eyebrow">Browse content</p>
              <h2>
                {totalListings} PDFs ready - {services.length} services ready
              </h2>
            </div>
          </div>

          <label className="simple-marketplace-search-field">
            <span className="visually-hidden">Search by title or subject</span>
            <div className="simple-marketplace-search-input">
              <i className="bi bi-search" />
              <input
                className="input"
                onChange={(event) => handleFilterChange("search", event.target.value)}
                placeholder="Search by title, subject, or website service"
                type="search"
                value={filters.search}
              />
            </div>
          </label>

          <div className="simple-marketplace-mini-filters">
            <label className="simple-mini-filter">
              <i className="bi bi-building" />
              <select className="input" onChange={(event) => handleFilterChange("university", event.target.value)} value={filters.university}>
                {universityOptions.map((option) => (
                  <option key={option.value || "all-university"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="simple-mini-filter">
              <i className="bi bi-diagram-3" />
              <select className="input" onChange={(event) => handleFilterChange("branch", event.target.value)} value={filters.branch}>
                {branchOptions.map((option) => (
                  <option key={option.value || "all-branch"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="simple-mini-filter">
              <i className="bi bi-calendar4-event" />
              <select className="input" onChange={(event) => handleFilterChange("year", event.target.value)} value={filters.year}>
                {yearOptions.map((option) => (
                  <option key={option.value || "all-year"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="simple-mini-filter">
              <i className="bi bi-collection-fill" />
              <select className="input" onChange={(event) => handleFilterChange("semester", event.target.value)} value={filters.semester}>
                {semesterOptions.map((option) => (
                  <option key={option.value || "all-semester"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="simple-mini-filter">
              <i className="bi bi-sort-down" />
              <select className="input" onChange={(event) => handleFilterChange("sort", event.target.value)} value={filters.sort}>
                <option value="latest">Latest</option>
                <option value="popularity">Popularity</option>
                <option value="price_asc">Price Low-High</option>
                <option value="price_desc">Price High-Low</option>
              </select>
            </label>

            {hasActiveFilters ? (
              <button className="simple-mini-filter action" onClick={handleResetFilters} type="button">
                <i className="bi bi-arrow-counterclockwise" />
                <span>Reset</span>
              </button>
            ) : null}
          </div>
        </form>

        <section className="stack-section">
          <SectionHeader
            eyebrow="Exams Micro Download"
            title="Current exam PDF sections"
            description={`Semester exam and CIA exam cards stay separate here. Each exam category can surface up to ${MARKETPLACE_CATEGORY_LIMIT} live PDFs.`}
          />

          {listingError ? <p className="form-error">{listingError}</p> : null}
          {isListingLoading ? <LoadingCard message="Loading exam PDFs..." /> : null}

          {!isListingLoading && !listingError && hasExamItems ? (
            <section className="stack-section">
              {semesterExamItems.length ? (
                <section className="stack-section">
                  <SectionHeader
                    eyebrow="Semester Exam"
                    title="Current semester exam PDFs"
                    description={`Live mode section for semester exams. Showing up to ${MARKETPLACE_CATEGORY_LIMIT} PDFs.`}
                  />
                  <div className="marketplace-grid simple-marketplace-grid">
                    {semesterExamItems.map((listing) => (
                      <MarketplaceListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                </section>
              ) : null}

              {ciaExamItems.length ? (
                <section className="stack-section">
                  <SectionHeader
                    eyebrow="CIA Exam"
                    title="Current CIA exam PDFs"
                    description={`Live mode section for CIA exams. Showing up to ${MARKETPLACE_CATEGORY_LIMIT} PDFs.`}
                  />
                  <div className="marketplace-grid simple-marketplace-grid">
                    {ciaExamItems.map((listing) => (
                      <MarketplaceListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                </section>
              ) : null}
            </section>
          ) : null}

          {!isListingLoading && !listingError && !hasExamItems ? (
            <EmptyStateCard
              title="No exam micro PDFs found"
              description={
                hasActiveFilters
                  ? "Try clearing a few academic filters to see more semester and CIA exam PDFs."
                  : "Published semester and CIA exam PDFs will appear here as soon as admin uploads them."
              }
              action={
                hasActiveFilters ? (
                  <button className="button primary" onClick={handleResetFilters} type="button">
                    <i className="bi bi-arrow-counterclockwise" />
                    Reset filters
                  </button>
                ) : null
              }
            />
          ) : null}
        </section>

        <section className="stack-section">
          <SectionHeader
            eyebrow="Notes Download"
            title="Browse notes and study materials"
            description="Notes, generated answer PDFs, and other non-exam marketplace content stay together in this section."
          />

          {isListingLoading ? <LoadingCard message="Loading notes..." /> : null}

          {!isListingLoading && !listingError && hasNoteItems ? (
            <div className="marketplace-grid simple-marketplace-grid">
              {notesItems.map((listing) => (
                <MarketplaceListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : null}

          {!isListingLoading && !listingError && !hasNoteItems ? (
            <EmptyStateCard
              title="No notes match these filters yet"
              description={
                hasActiveFilters
                  ? "Try widening your search or clearing branch, year, and semester filters."
                  : "Published notes will appear here as soon as they are available."
              }
            />
          ) : null}

          {!isListingLoading && !listingError && upcomingCount ? (
            <section className="stack-section">
              <SectionHeader
                eyebrow="Upcoming PDFs"
                title="Scheduled releases"
                description="These PDFs are already listed and will unlock automatically when their go-live time arrives."
              />
              <div className="marketplace-grid simple-marketplace-grid">
                {result.upcomingItems.map((listing) => (
                  <MarketplaceListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>
          ) : null}
        </section>

        <section className="stack-section">
          <SectionHeader
            eyebrow="Services"
            title="Buy ready-made websites and digital setups"
            description="Portfolio websites, commercial business sites, product showcase templates, and more are available here with ZIP delivery after purchase."
          />

          {serviceError ? <p className="form-error">{serviceError}</p> : null}
          {isServiceLoading ? <LoadingCard message="Loading website services..." /> : null}

          {!isServiceLoading && !serviceError && hasServiceItems ? (
            <section className="stack-section">
              {serviceSections.map((section) => (
                <section className="stack-section" key={section.value}>
                  <SectionHeader
                    eyebrow="Service category"
                    title={section.label}
                    description={SERVICE_SECTION_DESCRIPTIONS[section.value]}
                  />
                  <div className="marketplace-grid simple-marketplace-grid">
                    {section.items.map((service) => (
                      <ServiceListingCard key={service.id} service={service} />
                    ))}
                  </div>
                </section>
              ))}
            </section>
          ) : null}

          {!isServiceLoading && !serviceError && !hasServiceItems ? (
            <EmptyStateCard
              title="No website services found"
              description={
                filters.search
                  ? "Try a shorter search keyword to browse more website service cards."
                  : "Admin-created website service cards will appear here after they are published."
              }
            />
          ) : null}
        </section>
      </section>
    </>
  );
}
