import { apiDownload, apiPublicDownload, apiRequest } from "./client.js";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export function fetchLibrary(accessToken) {
  return apiRequest("/library", {
    headers: authHeaders(accessToken),
  });
}

export function fetchLibraryItem(accessToken, purchaseId) {
  return apiRequest(`/library/${purchaseId}`, {
    headers: authHeaders(accessToken),
  });
}

export function downloadLibraryItem(accessToken, purchaseId) {
  return apiDownload(`/library/${purchaseId}/download`, accessToken);
}

export function downloadGuestLibraryItem(purchaseId, token) {
  return apiPublicDownload(`/library/guest/${purchaseId}/download`, {
    "x-guest-purchase-token": token,
  });
}
