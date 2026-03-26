import { ApiError } from "../utils/ApiError.js";
import {
  ensureEnum,
  ensureNumericAmount,
  ensureRequiredString,
  normalizeOptionalString,
} from "./common.js";

const UPI_ID_PATTERN = /^[a-z0-9._-]{2,}@[a-z]{2,}$/i;
const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
const BANK_ACCOUNT_PATTERN = /^\d{6,20}$/;

function maskBankAccountNumber(value) {
  const lastFour = value.slice(-4);
  return `A/C ending ${lastFour}`;
}

export function validateWithdrawalRequest(req, _res, next) {
  try {
    const payoutMethod = ensureEnum(
      normalizeOptionalString(req.body?.payoutMethod, { maxLength: 40 }).toLowerCase() || "upi",
      ["upi", "bank_account"],
      "payoutMethod",
    );
    const accountHolderName = ensureRequiredString(
      req.body?.payoutDetails?.accountHolderName ?? req.body?.accountHolderName,
      "accountHolderName",
      { maxLength: 120 },
    );

    let accountReference = "";
    const payoutDetails = {
      accountHolderName,
      upiId: "",
      bankAccountNumber: "",
      ifscCode: "",
    };

    if (payoutMethod === "upi") {
      const upiId = ensureRequiredString(
        req.body?.payoutDetails?.upiId ?? req.body?.upiId,
        "upiId",
        { maxLength: 120, collapseWhitespace: false },
      ).toLowerCase();

      if (!UPI_ID_PATTERN.test(upiId)) {
        throw new ApiError(422, "upiId must be a valid UPI handle.");
      }

      payoutDetails.upiId = upiId;
      accountReference = upiId;
    } else {
      const bankAccountNumber = ensureRequiredString(
        req.body?.payoutDetails?.bankAccountNumber ?? req.body?.bankAccountNumber,
        "bankAccountNumber",
        { maxLength: 24, collapseWhitespace: false },
      ).replace(/\s+/g, "");
      const ifscCode = ensureRequiredString(
        req.body?.payoutDetails?.ifscCode ?? req.body?.ifscCode,
        "ifscCode",
        { maxLength: 20, collapseWhitespace: false },
      ).toUpperCase();

      if (!BANK_ACCOUNT_PATTERN.test(bankAccountNumber)) {
        throw new ApiError(422, "bankAccountNumber must contain 6 to 20 digits.");
      }

      if (!IFSC_PATTERN.test(ifscCode)) {
        throw new ApiError(422, "ifscCode must be a valid IFSC code.");
      }

      payoutDetails.bankAccountNumber = bankAccountNumber;
      payoutDetails.ifscCode = ifscCode;
      accountReference = maskBankAccountNumber(bankAccountNumber);
    }

    req.body = {
      amountInr: ensureNumericAmount(req.body?.amountInr, "amountInr", { min: 1, max: 100000 }),
      payoutMethod,
      accountReference,
      userNote: normalizeOptionalString(req.body?.userNote, { maxLength: 300 }),
      payoutDetails,
    };
    return next();
  } catch (error) {
    return next(error);
  }
}
