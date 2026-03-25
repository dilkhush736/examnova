export type UserRole = "student" | "seller" | "admin";

export type AcademicTaxonomy = {
  university: string;
  branch: string;
  year: string;
  semester: string;
  subject: string;
};

export type MarketplaceListingVisibility = "draft" | "published" | "locked-upcoming";

export type MarketplaceListing = {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceInr: number;
  sellerId: string;
  visibility: MarketplaceListingVisibility;
  taxonomy: AcademicTaxonomy;
};

export type SeoRouteDefinition = {
  path: string;
  title: string;
  description: string;
};
