import { MARKETPLACE_COVER_SEAL_LABELS } from "../features/marketplace/marketplace.constants.js";

const MARKETPLACE_DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatMarketplaceDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return MARKETPLACE_DATE_FORMATTER.format(date);
}

export function toDateTimeLocalValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function isListingReleaseLocked(listing, now = Date.now()) {
  if (!listing?.releaseAt) {
    return false;
  }

  const releaseTime = new Date(listing.releaseAt).getTime();
  if (Number.isNaN(releaseTime)) {
    return false;
  }

  return releaseTime > now;
}

export function getListingCardDate(listing) {
  return listing?.releaseAt || listing?.publishedAt || listing?.createdAt || null;
}

export function getCoverSealLabel(value) {
  return MARKETPLACE_COVER_SEAL_LABELS[value] || "";
}

export function getCountdownParts(target, now = Date.now()) {
  if (!target) {
    return null;
  }

  const targetTime = new Date(target).getTime();
  if (Number.isNaN(targetTime)) {
    return null;
  }

  const diffMs = targetTime - now;
  if (diffMs <= 0) {
    return null;
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const segments = [];
  if (days) {
    segments.push(`${days}d`);
  }
  if (days || hours) {
    segments.push(`${hours}h`);
  }
  segments.push(`${minutes}m`, `${seconds}s`);

  return {
    days,
    hours,
    minutes,
    seconds,
    shortLabel: segments.join(" "),
  };
}
