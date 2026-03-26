import { ApiError } from "../utils/ApiError.js";
import { MARKETPLACE_COVER_SEALS } from "../constants/app.constants.js";
import { ensureNumericAmount, ensureOptionalDateTime, normalizeOptionalString } from "./common.js";

export function validateAdminUserAction(req, _res, next) {
  try {
    const action = normalizeOptionalString(req.body?.action, { maxLength: 20 }).toLowerCase();
    if (!["block", "unblock"].includes(action)) {
      throw new ApiError(422, "action must be block or unblock.");
    }

    req.body = {
      action,
      reason: normalizeOptionalString(req.body?.reason, { maxLength: 240 }),
    };
    return next();
  } catch (error) {
    return next(error);
  }
}

export function validateAdminListingAction(req, _res, next) {
  try {
    const action = normalizeOptionalString(req.body?.action, { maxLength: 30 }).toLowerCase();
    if (!["publish", "unlist", "flag_suspicious", "clear_flag"].includes(action)) {
      throw new ApiError(422, "action must be publish, unlist, flag_suspicious, or clear_flag.");
    }

    req.body = {
      action,
      reason: normalizeOptionalString(req.body?.reason, { maxLength: 240 }),
    };
    return next();
  } catch (error) {
    return next(error);
  }
}

export function validateAdminListingUpdate(req, _res, next) {
  try {
    const title = normalizeOptionalString(req.body?.title, { maxLength: 140 });
    const coverSeal = normalizeOptionalString(req.body?.coverSeal, { maxLength: 20 }).toLowerCase();

    if (coverSeal && !MARKETPLACE_COVER_SEALS.includes(coverSeal)) {
      throw new ApiError(422, `coverSeal must be one of: ${MARKETPLACE_COVER_SEALS.join(", ")}.`);
    }

    req.body = {
      title,
      priceInr: ensureNumericAmount(req.body?.priceInr, "priceInr", { min: 4, max: 10 }),
      releaseAt: ensureOptionalDateTime(req.body?.releaseAt, "releaseAt"),
      coverSeal,
    };

    if (!req.body.title) {
      throw new ApiError(422, "title is required.");
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

export function validateAdminWithdrawalAction(req, _res, next) {
  try {
    const action = normalizeOptionalString(req.body?.action, { maxLength: 30 }).toLowerCase();
    if (!["approve", "reject", "mark_paid"].includes(action)) {
      throw new ApiError(422, "action must be approve, reject, or mark_paid.");
    }

    req.body = {
      action,
      adminNote: normalizeOptionalString(req.body?.adminNote, { maxLength: 400, collapseWhitespace: false }),
      payoutReference: normalizeOptionalString(req.body?.payoutReference, { maxLength: 120 }),
    };
    return next();
  } catch (error) {
    return next(error);
  }
}
