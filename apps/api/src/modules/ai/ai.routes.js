import { Router } from "express";
import { aiController } from "./ai.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth, requireProfessionalMode } from "../../middleware/auth.middleware.js";
import { aiActionRateLimiter } from "../../middleware/index.js";
import {
  validateQuestionDetectionRequest,
  validateQuestionSelectionUpdate,
} from "../../validators/index.js";

const router = Router();

router.post(
  "/documents/:documentId/detect",
  requireAuth,
  requireProfessionalMode,
  aiActionRateLimiter,
  validateQuestionDetectionRequest,
  asyncHandler(aiController.detectQuestions),
);
router.get(
  "/documents/:documentId/questions",
  requireAuth,
  requireProfessionalMode,
  asyncHandler(aiController.getDetectedQuestions),
);
router.patch(
  "/documents/:documentId/questions/selection",
  requireAuth,
  requireProfessionalMode,
  aiActionRateLimiter,
  validateQuestionSelectionUpdate,
  asyncHandler(aiController.updateQuestionSelections),
);
router.delete(
  "/documents/:documentId/questions",
  requireAuth,
  requireProfessionalMode,
  asyncHandler(aiController.resetDetectedQuestions),
);

export { router as aiRoutes };
