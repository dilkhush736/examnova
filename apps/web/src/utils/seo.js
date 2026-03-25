const SITE_NAME = "ExamNova AI";
const SITE_URL = import.meta.env.VITE_SITE_URL || "http://localhost:5173";
const DEFAULT_DESCRIPTION =
  "ExamNova AI helps students discover compact exam-ready PDFs, important questions, and structured semester-based preparation content.";

export function buildPageTitle(title) {
  return `${title} | ${SITE_NAME}`;
}

export function buildCanonicalUrl(pathname = "/") {
  const base = SITE_URL.replace(/\/+$/, "");
  const suffix = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${suffix}`;
}

export function buildSeoPayload({
  title,
  description = DEFAULT_DESCRIPTION,
  pathname = "/",
  image = "",
  type = "website",
  robots = "index,follow",
  jsonLd = null,
}) {
  const canonical = buildCanonicalUrl(pathname);
  const fullTitle = buildPageTitle(title);

  return {
    title: fullTitle,
    description,
    canonical,
    robots,
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      image,
      type,
    },
    twitter: {
      title: fullTitle,
      description,
      image,
      card: image ? "summary_large_image" : "summary",
    },
    jsonLd,
  };
}

export function buildBreadcrumbSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: buildCanonicalUrl(item.href),
    })),
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function buildCollectionSchema({ title, description, pathname }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: buildCanonicalUrl(pathname),
  };
}

export function buildProductSchema({ title, description, pathname, priceInr, sellerName }) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description,
    brand: SITE_NAME,
    category: "Exam PDF",
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: priceInr || 0,
      availability: "https://schema.org/InStock",
      url: buildCanonicalUrl(pathname),
    },
    seller: {
      "@type": "Organization",
      name: sellerName || SITE_NAME,
    },
  };
}

export function buildFaqSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
