import { apiRequest } from "./client.js";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export function fetchNotifications(accessToken, query = "") {
  return apiRequest(`/notifications${query ? `?${query}` : ""}`, {
    headers: authHeaders(accessToken),
  });
}

export function markNotificationRead(accessToken, notificationId) {
  return apiRequest(`/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
  });
}

export function markAllNotificationsRead(accessToken) {
  return apiRequest("/notifications/read-all", {
    method: "PATCH",
    headers: authHeaders(accessToken),
  });
}
