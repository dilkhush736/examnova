import { ensureNumericAmount, normalizeOptionalString } from "./common.js";

export function validateWithdrawalRequest(req, _res, next) {
  try {
    req.body = {
      amountInr: ensureNumericAmount(req.body?.amountInr, "amountInr", { min: 1, max: 100000 }),
      payoutMethod: normalizeOptionalString(req.body?.payoutMethod, { maxLength: 40 }) || "manual",
      accountReference: normalizeOptionalString(req.body?.accountReference, { maxLength: 140 }),
      userNote: normalizeOptionalString(req.body?.userNote, { maxLength: 300 }),
      payoutDetails:
        req.body?.payoutDetails && typeof req.body.payoutDetails === "object" && !Array.isArray(req.body.payoutDetails)
          ? req.body.payoutDetails
          : {},
    };
    return next();
  } catch (error) {
    return next(error);
  }
}
