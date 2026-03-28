import { ApiError } from "../utils/ApiError.js";
import {
  MARKETPLACE_COVER_SEALS,
  MARKETPLACE_LISTING_CATEGORIES,
  MARKETPLACE_PDF_SECTIONS,
  SERVICE_LISTING_CATEGORIES,
} from "../constants/app.constants.js";
import {
  ensureOptionalDateTime,
  ensureNumericAmount,
  ensureObjectId,
  ensureRequiredString,
  normalizeStringArray,
  normalizeBoolean,
  normalizeOptionalString,
} from "./common.js";
import { normalizeAcademicTaxonomy, normalizeStudyMetadata } from "../utils/academicTaxonomy.js";

function validateTaxonomy(body) {
  return normalizeAcademicTaxonomy(body || {});
}

function validatePrice(priceInr) {
  return ensureNumericAmount(priceInr, "priceInr", { min: 4, max: 10 });
}

function looksLikePdf(buffer) {
  return buffer?.subarray?.(0, 4)?.toString?.("utf8") === "%PDF";
}

function normalizeCoverSeal(value) {
  const coverSeal = normalizeOptionalString(value, { maxLength: 20 }).toLowerCase();

  if (!coverSeal) {
    return "";
  }

  if (!MARKETPLACE_COVER_SEALS.includes(coverSeal)) {
    throw new ApiError(422, `coverSeal must be one of: ${MARKETPLACE_COVER_SEALS.join(", ")}.`);
  }

  return coverSeal;
}

function normalizeCategory(value) {
  const category = normalizeOptionalString(value, { maxLength: 40 }).toLowerCase();

  if (!category) {
    throw new ApiError(422, "category is required.");
  }

  if (!MARKETPLACE_LISTING_CATEGORIES.includes(category)) {
    throw new ApiError(422, `category must be one of: ${MARKETPLACE_LISTING_CATEGORIES.join(", ")}.`);
  }

  return category;
}

function normalizePdfSection(value) {
  const section = normalizeOptionalString(value, { maxLength: 40 }).toLowerCase() || "exam_micro";

  if (!MARKETPLACE_PDF_SECTIONS.includes(section)) {
    throw new ApiError(422, `section must be one of: ${MARKETPLACE_PDF_SECTIONS.join(", ")}.`);
  }

  return section;
}

function normalizeServiceCategory(value) {
  const category = normalizeOptionalString(value, { maxLength: 50 }).toLowerCase();
  if (!category) {
    throw new ApiError(422, "category is required.");
  }
  if (!SERVICE_LISTING_CATEGORIES.includes(category)) {
    throw new ApiError(422, `category must be one of: ${SERVICE_LISTING_CATEGORIES.join(", ")}.`);
  }
  return category;
}

function normalizeUrlField(value, field, { required = false } = {}) {
  const normalized = normalizeOptionalString(value, {
    maxLength: 400,
    collapseWhitespace: false,
  });

  if (!normalized) {
    if (required) {
      throw new ApiError(422, `${field} is required.`);
    }
    return "";
  }

  try {
    const parsed = new URL(normalized);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Invalid protocol");
    }
    return parsed.toString();
  } catch {
    throw new ApiError(422, `${field} must be a valid http or https URL.`);
  }
}

function buildSanitizedPayload(body) {
  const studyMetadata = normalizeStudyMetadata(body || {});
  const section = normalizePdfSection(body?.section);
  const category = section === "exam_micro" ? normalizeCategory(body?.category) : "";

  return {
    title: ensureRequiredString(body?.title, "title", { maxLength: 140 }),
    description: normalizeOptionalString(body?.description, { maxLength: 1200 }),
    section,
    category,
    priceInr: validatePrice(body?.priceInr),
    visibility: normalizeOptionalString(body?.visibility, { maxLength: 20 }).toLowerCase() || "draft",
    tags: studyMetadata.tags,
    studyMetadata: {
      examFocus: studyMetadata.examFocus,
      questionType: studyMetadata.questionType,
      difficultyLevel: studyMetadata.difficultyLevel,
      intendedAudience: studyMetadata.intendedAudience,
    },
    seoTitle: normalizeOptionalString(body?.seoTitle, { maxLength: 160 }),
    seoDescription: normalizeOptionalString(body?.seoDescription, { maxLength: 260 }),
    isFeatured: normalizeBoolean(body?.isFeatured, false),
    releaseAt: ensureOptionalDateTime(body?.releaseAt, "releaseAt"),
    coverSeal: normalizeCoverSeal(body?.coverSeal),
    taxonomy: validateTaxonomy(body),
  };
}

function buildServiceSanitizedPayload(body) {
  const priceInr = ensureNumericAmount(body?.priceInr, "priceInr", { min: 99, max: 500000 });
  const offerPriceInr = body?.offerPriceInr === undefined || body?.offerPriceInr === null || body?.offerPriceInr === ""
    ? 0
    : ensureNumericAmount(body?.offerPriceInr, "offerPriceInr", { min: 0, max: 500000 });

  if (offerPriceInr && offerPriceInr > priceInr) {
    throw new ApiError(422, "offerPriceInr cannot be greater than priceInr.");
  }

  return {
    title: ensureRequiredString(body?.title, "title", { maxLength: 140 }),
    category: normalizeServiceCategory(body?.category),
    shortDescription: ensureRequiredString(body?.shortDescription, "shortDescription", { maxLength: 220 }),
    details: normalizeOptionalString(body?.details, { maxLength: 4000, collapseWhitespace: false }),
    techStack: normalizeStringArray(body?.techStack, { maxItems: 12, itemMaxLength: 40 }),
    demoUrl: normalizeUrlField(body?.demoUrl, "demoUrl", { required: true }),
    repoUrl: normalizeUrlField(body?.repoUrl, "repoUrl"),
    priceInr,
    offerPriceInr,
    visibility: normalizeOptionalString(body?.visibility, { maxLength: 20 }).toLowerCase() || "draft",
    isFeatured: normalizeBoolean(body?.isFeatured, false),
    seoTitle: normalizeOptionalString(body?.seoTitle, { maxLength: 160 }),
    seoDescription: normalizeOptionalString(body?.seoDescription, { maxLength: 260 }),
  };
}

export function validateAdminUploadCreate(req, _res, next) {
  try {
    const pdfFile = req.files?.pdf?.[0];
    if (!pdfFile) {
      throw new ApiError(422, "A PDF file is required.");
    }
    if (!looksLikePdf(pdfFile.buffer)) {
      throw new ApiError(415, "Uploaded admin file content is not a valid PDF.");
    }
    req.body = buildSanitizedPayload(req.body || {});
    return next();
  } catch (error) {
    return next(error);
  }
}

export function validateAdminUploadUpdate(req, _res, next) {
  try {
    req.body = buildSanitizedPayload(req.body || {});
    return next();
  } catch (error) {
    return next(error);
  }
}

export function validateUpcomingLockedCreate(req, _res, next) {
  try {
    req.body = {
      title: ensureRequiredString(req.body?.title, "title", { maxLength: 140 }),
      summary: normalizeOptionalString(req.body?.summary, { maxLength: 1200 }),
      adminUploadId: req.body?.adminUploadId ? ensureObjectId(req.body.adminUploadId, "adminUploadId") : "",
      tags: normalizeStudyMetadata(req.body || {}).tags,
      coverImageUrl: normalizeOptionalString(req.body?.coverImageUrl, { maxLength: 400 }),
      isFeatured: normalizeBoolean(req.body?.isFeatured, false),
      visibility: req.body?.visibility === undefined ? true : normalizeBoolean(req.body?.visibility, true),
      visibilityStartAt: normalizeOptionalString(req.body?.visibilityStartAt, { maxLength: 40 }),
      expectedReleaseAt: normalizeOptionalString(req.body?.expectedReleaseAt, { maxLength: 40 }),
      status: normalizeOptionalString(req.body?.status, { maxLength: 20 }).toLowerCase() || "upcoming",
      taxonomy: validateTaxonomy(req.body),
    };
    return next();
  } catch (error) {
    return next(error);
  }
}

export function validateUpcomingLockedUpdate(req, _res, next) {
  return validateUpcomingLockedCreate(req, _res, next);
}

export function validateUpcomingLockedAction(req, _res, next) {
  try {
    const action = normalizeOptionalString(req.body?.action, { maxLength: 20 }).toLowerCase();
    const allowedActions = new Set(["schedule", "publish", "archive", "cancel"]);
    if (!allowedActions.has(action)) {
      throw new ApiError(422, "action must be one of schedule, publish, archive, or cancel.");
    }

    req.body = { action };
    return next();
  } catch (error) {
    return next(error);
  }
}

export function validateServiceListingCreate(req, _res, next) {
  try {
    const imageFile = req.files?.image?.[0];
    const zipFile = req.files?.zipFile?.[0];
    if (!imageFile) {
      throw new ApiError(422, "A service image is required.");
    }
    if (!zipFile) {
      throw new ApiError(422, "A ZIP file is required.");
    }
    req.body = buildServiceSanitizedPayload(req.body || {});
    return next();
  } catch (error) {
    return next(error);
  }
}

export function validateServiceListingUpdate(req, _res, next) {
  try {
    req.body = buildServiceSanitizedPayload(req.body || {});
    return next();
  } catch (error) {
    return next(error);
  }
}
