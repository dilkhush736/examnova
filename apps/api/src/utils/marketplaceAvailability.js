import { MARKETPLACE_COVER_SEALS } from "../constants/app.constants.js";
import { ApiError } from "./ApiError.js";

const COVER_SEAL_SET = new Set(MARKETPLACE_COVER_SEALS);

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeCoverSeal(value) {
  const normalized = normalizeText(value).toLowerCase();

  if (!normalized) {
    return "";
  }

  if (!COVER_SEAL_SET.has(normalized)) {
    throw new ApiError(
      422,
      `coverSeal must be one of: ${MARKETPLACE_COVER_SEALS.join(", ")}.`,
    );
  }

  return normalized;
}

export function normalizeReleaseAt(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(422, "releaseAt must be a valid date and time.");
  }

  return date;
}

export function isReleaseLocked(record, now = Date.now()) {
  if (!record?.releaseAt) {
    return false;
  }

  return new Date(record.releaseAt).getTime() > now;
}

export function getListingDisplayDate(record) {
  return record?.releaseAt || record?.publishedAt || record?.createdAt || null;
}

export function ensureReleasedOrThrow(record) {
  if (!isReleaseLocked(record)) {
    return;
  }

  const releaseAt = new Date(record.releaseAt);
  throw new ApiError(
    423,
    `This PDF will be available on ${releaseAt.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    })}.`,
    {
      code: "LISTING_RELEASE_LOCKED",
      releaseAt: record.releaseAt,
    },
  );
}
