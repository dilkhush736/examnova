import { ApiError } from "../utils/ApiError.js";
import { normalizeOptionalString, ensureRequiredString } from "./common.js";

export function validateProfileUpdate(req, _res, next) {
  try {
    const phone = normalizeOptionalString(req.body?.phone, { maxLength: 30, collapseWhitespace: false });
    if (phone && !/^[0-9+\-() ]{7,20}$/.test(phone)) {
      throw new ApiError(422, "phone must be a valid contact number.");
    }

    const avatarUrl = normalizeOptionalString(req.body?.avatarUrl, { maxLength: 400 });
    if (avatarUrl && !/^https?:\/\//i.test(avatarUrl)) {
      throw new ApiError(422, "avatarUrl must be a valid http or https URL.");
    }

    req.body = {
      name: ensureRequiredString(req.body?.name, "name", { maxLength: 80 }),
      phone,
      avatarUrl,
      bio: normalizeOptionalString(req.body?.bio, { maxLength: 500, collapseWhitespace: false }),
      university: normalizeOptionalString(req.body?.university, { maxLength: 120 }),
      branch: normalizeOptionalString(req.body?.branch, { maxLength: 120 }),
      year: normalizeOptionalString(req.body?.year, { maxLength: 40 }),
      semester: normalizeOptionalString(req.body?.semester, { maxLength: 40 }),
    };

    return next();
  } catch (error) {
    return next(error);
  }
}
