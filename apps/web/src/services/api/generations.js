import { apiDownload, apiRequest } from "./client.js";

function authHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export function listGenerations(accessToken) {
  return apiRequest("/pdfs", {
    headers: authHeaders(accessToken),
  });
}

export function generateAnswers(accessToken, payload) {
  return apiRequest("/pdfs/generate", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export function getGeneration(accessToken, generationId) {
  return apiRequest(`/pdfs/${generationId}`, {
    headers: authHeaders(accessToken),
  });
}

export function getLatestGenerationForDocument(accessToken, documentId) {
  return apiRequest(`/pdfs/documents/${documentId}/latest`, {
    headers: authHeaders(accessToken),
  });
}

export function updateGeneratedAnswers(accessToken, generationId, payload) {
  return apiRequest(`/pdfs/${generationId}/answers`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export function renderFinalPdf(accessToken, generationId) {
  return apiRequest(`/pdfs/${generationId}/render`, {
    method: "POST",
    headers: authHeaders(accessToken),
  });
}

export function downloadFinalPdf(accessToken, generationId) {
  return apiDownload(`/pdfs/${generationId}/download`, accessToken);
}
