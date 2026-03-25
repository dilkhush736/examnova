import { apiRequest } from "./client.js";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export function fetchWithdrawals(accessToken) {
  return apiRequest("/withdrawals", {
    headers: authHeaders(accessToken),
  });
}

export function createWithdrawal(accessToken, payload) {
  return apiRequest("/withdrawals", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export function cancelWithdrawal(accessToken, withdrawalId) {
  return apiRequest(`/withdrawals/${withdrawalId}/cancel`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
  });
}
