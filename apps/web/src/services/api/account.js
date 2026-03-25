import { apiRequest } from "./client.js";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export function fetchDashboardSummary(accessToken) {
  return apiRequest("/dashboard/summary", {
    headers: authHeaders(accessToken),
  });
}

export function fetchActivityCounters(accessToken) {
  return apiRequest("/dashboard/activity-counters", {
    headers: authHeaders(accessToken),
  });
}

export function updateProfile(accessToken, payload) {
  return apiRequest("/profile/me", {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export function updateProfileSettings(accessToken, payload) {
  return apiRequest("/profile/me/settings", {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}
