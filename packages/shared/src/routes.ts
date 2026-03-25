import type { SeoRouteDefinition } from "./types";

export const publicSeoRoutes: SeoRouteDefinition[] = [
  {
    path: "/",
    title: "ExamNova AI | Exam-ready answer generation and PDF marketplace",
    description: "AI exam preparation platform with compact PDFs and structured public study marketplace.",
  },
  {
    path: "/marketplace/:university/:branch/:semester/:subject",
    title: "Marketplace taxonomy route",
    description: "Public indexable route for university, branch, semester, and subject-specific listings.",
  },
  {
    path: "/pdf/:listingSlug",
    title: "Marketplace PDF detail route",
    description: "Public detail route for an individual PDF listing.",
  },
];
