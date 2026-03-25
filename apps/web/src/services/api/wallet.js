import { apiRequest } from "./client.js";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export function fetchWallet(accessToken) {
  return apiRequest("/wallet", {
    headers: authHeaders(accessToken),
  });
}

export function fetchWalletTransactions(accessToken) {
  return apiRequest("/wallet/transactions", {
    headers: authHeaders(accessToken),
  });
}
