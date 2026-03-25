import { apiRequest } from "./client.js";

export function fetchSeoHomeData() {
  return apiRequest("/public/home");
}

export function fetchSeoDiscoveryIndex() {
  return apiRequest("/public/discovery-index");
}

export function fetchSeoLandingPage(type, slug) {
  return apiRequest(`/public/landing/${type}/${slug}`);
}

export function fetchSitemapData() {
  return apiRequest("/public/sitemap-data");
}
