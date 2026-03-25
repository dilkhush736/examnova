import { env } from "../../config/index.js";
import { MarketplaceListing, UpcomingLockedPdf } from "../../models/index.js";
import { ApiError } from "../../utils/ApiError.js";
import { slugify } from "../../utils/slugify.js";

const LANDING_TYPES = new Set([
  "university",
  "branch",
  "semester",
  "subject",
  "exam-preparation",
  "important-questions",
]);

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function siteUrl(pathname = "") {
  const base = env.publicSiteUrl.replace(/\/+$/, "");
  const suffix = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${suffix}`;
}

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function toSlugValueMap(values = []) {
  return values.reduce((accumulator, value) => {
    const normalized = normalizeText(value);
    if (normalized) {
      accumulator[slugify(normalized)] = normalized;
    }
    return accumulator;
  }, {});
}

function buildCollectionIntro(type, label) {
  if (type === "university") {
    return `Explore compact exam-preparation PDFs, revision notes, and semester-linked content for ${label}.`;
  }
  if (type === "branch") {
    return `Browse branch-specific exam PDFs, subject revision packs, and academic preparation content for ${label}.`;
  }
  if (type === "semester") {
    return `Find semester-focused PDFs, important-question collections, and exam revision material for ${label}.`;
  }
  if (type === "subject") {
    return `Discover subject-specific exam PDFs, important-question packs, and compact preparation material for ${label}.`;
  }
  if (type === "exam-preparation") {
    return `Exam preparation resources for ${label}, including compact notes, structured PDFs, and semester-aware revision content.`;
  }
  return `Important-question and exam-focused PDFs for ${label}, curated for quick revision and semester relevance.`;
}

function buildCollectionHeading(type, label) {
  if (type === "exam-preparation") {
    return `${label} Exam Preparation`;
  }
  if (type === "important-questions") {
    return `${label} Important Questions`;
  }
  return label;
}

function buildCollectionMeta(type, label, count) {
  const title = buildCollectionHeading(type, label);
  const description = `${buildCollectionIntro(type, label)} ${count} public PDF${count === 1 ? "" : "s"} currently indexed on ExamNova AI.`;
  return {
    title,
    description,
  };
}

function serializeListing(record) {
  return {
    id: record._id.toString(),
    title: record.title,
    slug: record.slug,
    description: record.description || "",
    priceInr: record.priceInr,
    taxonomy: record.taxonomy,
    tags: record.tags || [],
    sellerName: record.sellerId?.sellerProfile?.displayName || record.sellerId?.name || "ExamNova Seller",
    sellerRole: record.sellerId?.role || "student",
    sourceType: record.sourceType || "generated_pdf",
    viewCount: record.viewCount || 0,
    salesCount: record.salesCount || 0,
    seoTitle: record.seoTitle || record.title,
    seoDescription: record.seoDescription || record.description || "",
    updatedAt: record.updatedAt,
    publishedAt: record.publishedAt || record.createdAt,
  };
}

function serializeUpcoming(record) {
  return {
    id: record._id.toString(),
    title: record.title,
    slug: record.slug,
    summary: record.summary || "",
    taxonomy: record.taxonomy,
    tags: record.tags || [],
    expectedReleaseAt: record.expectedReleaseAt || null,
    isFeatured: Boolean(record.isFeatured),
    updatedAt: record.updatedAt,
  };
}

async function getDistinctTaxonomyValues(field) {
  return MarketplaceListing.distinct(`taxonomy.${field}`, {
    visibility: "published",
    isPublished: true,
    approvalStatus: "approved",
    moderationStatus: { $ne: "blocked" },
  });
}

async function resolveLandingLabel(type, slug) {
  if (!LANDING_TYPES.has(type)) {
    throw new ApiError(404, "Landing page type is not supported.");
  }

  if (type === "exam-preparation" || type === "important-questions") {
    const subjects = await getDistinctTaxonomyValues("subject");
    const subjectMap = toSlugValueMap(subjects);
    return subjectMap[slug] || null;
  }

  const values = await getDistinctTaxonomyValues(type);
  const map = toSlugValueMap(values);
  return map[slug] || null;
}

function buildListingQueryForLanding(type, label) {
  if (type === "exam-preparation" || type === "important-questions") {
    return {
      visibility: "published",
      isPublished: true,
      approvalStatus: "approved",
      moderationStatus: { $ne: "blocked" },
      $or: [
        { "taxonomy.subject": label },
        { tags: { $in: [slugify(label), "important", "important-questions", "exam-preparation"] } },
        { searchText: { $regex: label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      ],
    };
  }

  return {
    visibility: "published",
    isPublished: true,
    approvalStatus: "approved",
    moderationStatus: { $ne: "blocked" },
    [`taxonomy.${type}`]: label,
  };
}

function buildUpcomingQuery(type, label) {
  if (type === "exam-preparation" || type === "important-questions") {
    return {
      status: "upcoming",
      visibility: true,
      "taxonomy.subject": label,
    };
  }

  return {
    status: "upcoming",
    visibility: true,
    [`taxonomy.${type}`]: label,
  };
}

function buildRelatedLinks(listings, label) {
  const universities = new Map();
  const branches = new Map();
  const semesters = new Map();
  const subjects = new Map();

  listings.forEach((item) => {
    if (item.taxonomy?.university) {
      universities.set(slugify(item.taxonomy.university), item.taxonomy.university);
    }
    if (item.taxonomy?.branch) {
      branches.set(slugify(item.taxonomy.branch), item.taxonomy.branch);
    }
    if (item.taxonomy?.semester) {
      semesters.set(slugify(item.taxonomy.semester), item.taxonomy.semester);
    }
    if (item.taxonomy?.subject) {
      subjects.set(slugify(item.taxonomy.subject), item.taxonomy.subject);
    }
  });

  return {
    universities: Array.from(universities, ([slug, text]) => ({ slug, text, href: `/university/${slug}` })).slice(0, 6),
    branches: Array.from(branches, ([slug, text]) => ({ slug, text, href: `/branch/${slug}` })).slice(0, 6),
    semesters: Array.from(semesters, ([slug, text]) => ({ slug, text, href: `/semester/${slug}` })).slice(0, 6),
    subjects: Array.from(subjects, ([slug, text]) => ({ slug, text, href: `/subject/${slug}` })).slice(0, 6),
    examPreparation: {
      slug: slugify(label),
      text: `${label} exam preparation`,
      href: `/exam-preparation/${slugify(label)}`,
    },
    importantQuestions: {
      slug: slugify(label),
      text: `${label} important questions`,
      href: `/important-questions/${slugify(label)}`,
    },
  };
}

export const seoService = {
  async getSiteMapData() {
    const [listings, upcoming, universities, branches, semesters, subjects] = await Promise.all([
      MarketplaceListing.find({
        visibility: "published",
        isPublished: true,
        approvalStatus: "approved",
        moderationStatus: { $ne: "blocked" },
      }).select("slug updatedAt taxonomy"),
      UpcomingLockedPdf.find({
        visibility: true,
        status: "upcoming",
      }).select("slug updatedAt"),
      getDistinctTaxonomyValues("university"),
      getDistinctTaxonomyValues("branch"),
      getDistinctTaxonomyValues("semester"),
      getDistinctTaxonomyValues("subject"),
    ]);

    const staticUrls = [
      { loc: siteUrl("/"), changefreq: "weekly", priority: "1.0" },
      { loc: siteUrl("/marketplace"), changefreq: "daily", priority: "0.9" },
      { loc: siteUrl("/upcoming"), changefreq: "daily", priority: "0.8" },
      { loc: siteUrl("/faq"), changefreq: "monthly", priority: "0.6" },
      { loc: siteUrl("/resources"), changefreq: "weekly", priority: "0.7" },
    ];

    const listingUrls = listings.map((item) => ({
      loc: siteUrl(`/pdf/${item.slug}`),
      lastmod: item.updatedAt?.toISOString?.(),
      changefreq: "weekly",
      priority: "0.8",
    }));

    const upcomingUrls = upcoming.map((item) => ({
      loc: siteUrl(`/upcoming/${item.slug}`),
      lastmod: item.updatedAt?.toISOString?.(),
      changefreq: "weekly",
      priority: "0.6",
    }));

    const taxonomyUrls = [];
    universities.forEach((value) => taxonomyUrls.push({ loc: siteUrl(`/university/${slugify(value)}`), changefreq: "weekly", priority: "0.7" }));
    branches.forEach((value) => taxonomyUrls.push({ loc: siteUrl(`/branch/${slugify(value)}`), changefreq: "weekly", priority: "0.7" }));
    semesters.forEach((value) => taxonomyUrls.push({ loc: siteUrl(`/semester/${slugify(value)}`), changefreq: "weekly", priority: "0.7" }));
    subjects.forEach((value) => {
      taxonomyUrls.push({ loc: siteUrl(`/subject/${slugify(value)}`), changefreq: "weekly", priority: "0.8" });
      taxonomyUrls.push({ loc: siteUrl(`/exam-preparation/${slugify(value)}`), changefreq: "weekly", priority: "0.7" });
      taxonomyUrls.push({ loc: siteUrl(`/important-questions/${slugify(value)}`), changefreq: "weekly", priority: "0.7" });
    });

    return [...staticUrls, ...listingUrls, ...upcomingUrls, ...taxonomyUrls];
  },

  buildSitemapXml(urls) {
    const body = urls
      .map((item) => {
        const lastmod = item.lastmod ? `<lastmod>${escapeXml(item.lastmod)}</lastmod>` : "";
        const changefreq = item.changefreq ? `<changefreq>${escapeXml(item.changefreq)}</changefreq>` : "";
        const priority = item.priority ? `<priority>${escapeXml(item.priority)}</priority>` : "";
        return `<url><loc>${escapeXml(item.loc)}</loc>${lastmod}${changefreq}${priority}</url>`;
      })
      .join("");

    return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
  },

  buildRobotsTxt() {
    return [
      "User-agent: *",
      "Allow: /",
      "Disallow: /app",
      "Disallow: /admin",
      "Disallow: /login",
      "Disallow: /signup",
      "Disallow: /verify-otp",
      "Disallow: /forgot-password",
      "Disallow: /reset-password",
      "",
      `Sitemap: ${siteUrl("/sitemap.xml")}`,
    ].join("\n");
  },

  async getLandingPage(type, slug) {
    const label = await resolveLandingLabel(type, slug);
    if (!label) {
      throw new ApiError(404, "Public landing page not found.");
    }

    const [listings, upcoming] = await Promise.all([
      MarketplaceListing.find(buildListingQueryForLanding(type, label))
        .populate("sellerId", "name role sellerProfile")
        .sort({ isFeatured: -1, salesCount: -1, publishedAt: -1 })
        .limit(24),
      UpcomingLockedPdf.find(buildUpcomingQuery(type, label))
        .sort({ isFeatured: -1, expectedReleaseAt: 1, createdAt: -1 })
        .limit(8),
    ]);

    const serializedListings = listings.map(serializeListing);
    const serializedUpcoming = upcoming.map(serializeUpcoming);
    const meta = buildCollectionMeta(type, label, serializedListings.length);

    return {
      type,
      label,
      slug,
      heading: buildCollectionHeading(type, label),
      intro: buildCollectionIntro(type, label),
      meta,
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "Marketplace", href: "/marketplace" },
        { label: buildCollectionHeading(type, label), href: `/${type}/${slug}` },
      ],
      stats: {
        listingCount: serializedListings.length,
        upcomingCount: serializedUpcoming.length,
      },
      featuredListings: serializedListings.slice(0, 6),
      listings: serializedListings,
      upcomingLocked: serializedUpcoming,
      relatedLinks: buildRelatedLinks(serializedListings, label),
      faqItems: [
        {
          question: `How can I find ${label} exam PDFs?`,
          answer: `Use the ${buildCollectionHeading(type, label)} page to browse structured PDFs, subject-specific notes, and linked semester content on ExamNova AI.`,
        },
        {
          question: `Are these PDFs useful for last-minute revision?`,
          answer: "Yes. The public marketplace focuses on compact, exam-oriented PDFs designed for fast scanning and practical revision.",
        },
      ],
    };
  },

  async getDiscoveryIndex() {
    const [universities, branches, semesters, subjects] = await Promise.all([
      getDistinctTaxonomyValues("university"),
      getDistinctTaxonomyValues("branch"),
      getDistinctTaxonomyValues("semester"),
      getDistinctTaxonomyValues("subject"),
    ]);

    return {
      universities: universities.slice(0, 20).map((value) => ({ label: value, slug: slugify(value), href: `/university/${slugify(value)}` })),
      branches: branches.slice(0, 20).map((value) => ({ label: value, slug: slugify(value), href: `/branch/${slugify(value)}` })),
      semesters: semesters.slice(0, 20).map((value) => ({ label: value, slug: slugify(value), href: `/semester/${slugify(value)}` })),
      subjects: subjects.slice(0, 20).map((value) => ({ label: value, slug: slugify(value), href: `/subject/${slugify(value)}` })),
      examPreparation: subjects.slice(0, 20).map((value) => ({ label: `${value} exam preparation`, slug: slugify(value), href: `/exam-preparation/${slugify(value)}` })),
      importantQuestions: subjects.slice(0, 20).map((value) => ({ label: `${value} important questions`, slug: slugify(value), href: `/important-questions/${slugify(value)}` })),
    };
  },
};
