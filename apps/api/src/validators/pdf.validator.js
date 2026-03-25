import { ApiError } from "../utils/ApiError.js";
import {
  ensureObjectId,
  normalizeBoolean,
  normalizeOptionalString,
} from "./common.js";

export function validateAnswerGenerationRequest(req, _res, next) {
  try {
    const questionIds = Array.isArray(req.body?.questionIds)
      ? req.body.questionIds.slice(0, 200).map((questionId) => ensureObjectId(questionId, "questionId"))
      : [];

    req.body = {
      documentId: ensureObjectId(req.body?.documentId, "documentId"),
      prompt: normalizeOptionalString(req.body?.prompt, { maxLength: 400 }),
      forceRegenerate: normalizeBoolean(req.body?.forceRegenerate, false),
      questionIds,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}

export function validateAnswerItemsUpdate(req, _res, next) {
  try {
    req.params.id = ensureObjectId(req.params?.id, "generationId");
    if (!Array.isArray(req.body?.answerItems)) {
      throw new ApiError(422, "answerItems must be an array.");
    }

    req.body.answerItems = req.body.answerItems.slice(0, 200).map((item) => ({
      questionId: ensureObjectId(item?.questionId, "questionId"),
      order: item?.order === undefined ? undefined : Number(item.order),
      answerText: item?.answerText === undefined
        ? undefined
        : normalizeOptionalString(item.answerText, { maxLength: 12000, collapseWhitespace: false }),
    }));

    return next();
  } catch (error) {
    return next(error);
  }
}

export function validateFinalPdfRenderRequest(req, _res, next) {
  try {
    req.params.id = ensureObjectId(req.params?.id, "generationId");
    return next();
  } catch (error) {
    return next(error);
  }
}
