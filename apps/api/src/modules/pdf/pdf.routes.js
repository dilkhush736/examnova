import { Router } from "express";
import { pdfController } from "./pdf.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth, requireProfessionalMode } from "../../middleware/auth.middleware.js";
import { aiActionRateLimiter } from "../../middleware/index.js";
import {
  validateAnswerGenerationRequest,
  validateAnswerItemsUpdate,
  validateFinalPdfRenderRequest,
} from "../../validators/index.js";

const router = Router();

router.get("/", requireAuth, requireProfessionalMode, asyncHandler(pdfController.listPdfs));
router.get(
  "/documents/:documentId/latest",
  requireAuth,
  requireProfessionalMode,
  asyncHandler(pdfController.getLatestForDocument),
);
router.get("/:id/download", requireAuth, requireProfessionalMode, asyncHandler(pdfController.downloadFinalPdf));
router.get("/:id", requireAuth, requireProfessionalMode, asyncHandler(pdfController.getPdfGeneration));
router.post(
  "/generate",
  requireAuth,
  requireProfessionalMode,
  aiActionRateLimiter,
  validateAnswerGenerationRequest,
  asyncHandler(pdfController.createPdfGeneration),
);
router.patch(
  "/:id/answers",
  requireAuth,
  requireProfessionalMode,
  validateAnswerItemsUpdate,
  asyncHandler(pdfController.updateAnswerItems),
);
router.post(
  "/:id/render",
  requireAuth,
  requireProfessionalMode,
  aiActionRateLimiter,
  validateFinalPdfRenderRequest,
  asyncHandler(pdfController.renderFinalPdf),
);

export { router as pdfRoutes };
