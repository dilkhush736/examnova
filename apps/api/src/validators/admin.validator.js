import { ApiError } from "../utils/ApiError.js";
import { normalizeOptionalString } from "./common.js";

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
