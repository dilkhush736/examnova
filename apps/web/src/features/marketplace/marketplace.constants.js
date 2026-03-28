export const MARKETPLACE_PRICE_RANGE = {
  min: Number(import.meta.env.VITE_MARKETPLACE_MIN_PRICE || 4),
  max: Number(import.meta.env.VITE_MARKETPLACE_MAX_PRICE || 10),
};

export const MARKETPLACE_CATEGORY_LIMIT = 5;
export const MARKETPLACE_PDF_SECTION_OPTIONS = [
  { value: "exam_micro", label: "Exams Micro Download" },
  { value: "notes", label: "Notes Download" },
];
export const MARKETPLACE_CATEGORY_OPTIONS = [
  { value: "semester_exam", label: "Semester Exam" },
  { value: "cia_exam", label: "CIA Exam" },
];

export const MARKETPLACE_CATEGORY_LABELS = {
  semester_exam: "Semester Exam",
  cia_exam: "CIA Exam",
};
export const MARKETPLACE_PDF_SECTION_LABELS = {
  exam_micro: "Exams Micro Download",
  notes: "Notes Download",
};
export const SERVICE_CATEGORY_OPTIONS = [
  { value: "portfolio_website", label: "Portfolio Website" },
  { value: "commercial_website", label: "Commercial Website" },
  { value: "product_website", label: "Product Website" },
  { value: "landing_page", label: "Landing Page" },
  { value: "ecommerce_website", label: "E-commerce Website" },
];
export const SERVICE_CATEGORY_LABELS = {
  portfolio_website: "Portfolio Website",
  commercial_website: "Commercial Website",
  product_website: "Product Website",
  landing_page: "Landing Page",
  ecommerce_website: "E-commerce Website",
};

export const MARKETPLACE_COVER_SEAL_OPTIONS = [
  { value: "", label: "No seal" },
  { value: "new", label: "New" },
  { value: "premium", label: "Premium" },
  { value: "popular", label: "Popular" },
  { value: "updated", label: "Updated" },
];

export const MARKETPLACE_COVER_SEAL_LABELS = {
  new: "New",
  premium: "Premium",
  popular: "Popular",
  updated: "Updated",
};

export function getMarketplaceCategoryLabel(category) {
  return MARKETPLACE_CATEGORY_LABELS[category] || "";
}

export function getMarketplacePdfSectionLabel(section) {
  return MARKETPLACE_PDF_SECTION_LABELS[section] || "";
}

export function getServiceCategoryLabel(category) {
  return SERVICE_CATEGORY_LABELS[category] || "";
}
