export const MARKETPLACE_PRICE_RANGE = {
  min: Number(import.meta.env.VITE_MARKETPLACE_MIN_PRICE || 4),
  max: Number(import.meta.env.VITE_MARKETPLACE_MAX_PRICE || 10),
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
