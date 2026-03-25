import { ApiError } from "../utils/ApiError.js";
import { ensureObjectId, normalizeBoolean, normalizeOptionalString } from "./common.js";

export function validateQuestionDetectionRequest(req, _res, next) {
  try {
    req.params.documentId = ensureObjectId(req.params.documentId, "documentId");
    req.body = {
      prompt: normalizeOptionalString(req.body?.prompt, { maxLength: 400 }),
      forceRerun: normalizeBoolean(req.body?.forceRerun, false),
    };
    return next();
  } catch (error) {
    return next(error);
  }
}

export function validateQuestionSelectionUpdate(req, _res, next) {
  try {
    req.params.documentId = ensureObjectId(req.params.documentId, "documentId");

    if (!Array.isArray(req.body?.questionIds) || req.body.questionIds.length === 0) {
      throw new ApiError(422, "Please provide question ids to update.");
    }

    const questionIds = req.body.questionIds
      .slice(0, 500)
      .map((questionId) => ensureObjectId(questionId, "questionId"));

    req.body = {
      questionIds,
      selected: normalizeBoolean(req.body?.selected, false),
    };
    return next();
  } catch (error) {
    return next(error);
  }
}
