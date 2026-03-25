import { apiRequest } from "./client.js";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export function detectQuestions(accessToken, documentId, payload) {
  return apiRequest(`/ai/documents/${documentId}/detect`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export function listDetectedQuestions(accessToken, documentId) {
  return apiRequest(`/ai/documents/${documentId}/questions`, {
    headers: authHeaders(accessToken),
  });
}

export function updateQuestionSelections(accessToken, documentId, payload) {
  return apiRequest(`/ai/documents/${documentId}/questions/selection`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export function resetDetectedQuestions(accessToken, documentId) {
  return apiRequest(`/ai/documents/${documentId}/questions`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}
