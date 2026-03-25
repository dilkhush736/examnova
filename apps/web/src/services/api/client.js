const LOCAL_API_BASE_URL = "http://localhost:4000/api/v1";
const KNOWN_RENDER_API_BASE_URLS = {
  "https://examnovaai.onrender.com": "https://examnova-b9rf.onrender.com/api/v1",
};

function normalizeUrl(value) {
  return String(value || "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\/+$/, "");
}

function getApiBaseUrl() {
  const runtimeOrigin =
    typeof window !== "undefined" ? normalizeUrl(window.location.origin) : "";

  if (runtimeOrigin && KNOWN_RENDER_API_BASE_URLS[runtimeOrigin]) {
    return KNOWN_RENDER_API_BASE_URLS[runtimeOrigin];
  }

  return normalizeUrl(import.meta.env.VITE_API_BASE_URL) || LOCAL_API_BASE_URL;
}

export const API_BASE_URL = getApiBaseUrl();

export async function apiRequest(path, options = {}) {
  const { headers: optionHeaders = {}, ...restOptions } = options;
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const hasBody = options.body !== undefined && options.body !== null;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      ...(hasBody && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...optionHeaders,
    },
    ...restOptions,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || "Request failed.");
    error.status = response.status;
    error.details = payload.details || null;
    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("examnova:unauthorized", {
          detail: {
            path,
            message: error.message,
          },
        }),
      );
    }
    throw error;
  }

  return payload;
}

export async function apiDownload(path, accessToken) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.message || "Download failed.");
    error.status = response.status;
    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("examnova:unauthorized", {
          detail: {
            path,
            message: error.message,
          },
        }),
      );
    }
    throw error;
  }

  return {
    blob: await response.blob(),
    filename: response.headers.get("content-disposition") || "",
  };
}
