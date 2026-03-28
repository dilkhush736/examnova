import { apiRequest } from "./client.js";

function authHeaders(accessToken) {
  return accessToken
    ? {
        Authorization: `Bearer ${accessToken}`,
      }
    : {};
}

function toQueryString(filters = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function fetchPublicServices(filters = {}) {
  return apiRequest(`/services/public${toQueryString(filters)}`);
}

export function fetchPublicServiceDetail(slug) {
  return apiRequest(`/services/public/${slug}`);
}

export function fetchAdminServices(accessToken) {
  return apiRequest("/services/admin", {
    headers: authHeaders(accessToken),
  });
}

export function createAdminService(accessToken, formData) {
  return apiRequest("/services/admin", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: formData,
  });
}

export function updateAdminService(accessToken, serviceId, formData) {
  return apiRequest(`/services/admin/${serviceId}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: formData,
  });
}

export function deleteAdminService(accessToken, serviceId) {
  return apiRequest(`/services/admin/${serviceId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}
