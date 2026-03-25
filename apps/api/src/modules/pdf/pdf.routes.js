import { Router } from "express";
import { pdfController } from "./pdf.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { aiActionRateLimiter } from "../../middleware/index.js";
import {
  validateAnswerGenerationRequest,
  validateAnswerItemsUpdate,
  validateFinalPdfRenderRequest,
} from "../../validators/index.js";

const router = Router();

router.get("/", requireAuth, asyncHandler(pdfController.listPdfs));
router.get("/documents/:documentId/latest", requireAuth, asyncHandler(pdfController.getLatestForDocument));
router.get("/:id/download", requireAuth, asyncHandler(pdfController.downloadFinalPdf));
router.get("/:id", requireAuth, asyncHandler(pdfController.getPdfGeneration));
router.post("/generate", requireAuth, aiActionRateLimiter, validateAnswerGenerationRequest, asyncHandler(pdfController.createPdfGeneration));
router.patch("/:id/answers", requireAuth, validateAnswerItemsUpdate, asyncHandler(pdfController.updateAnswerItems));
router.post("/:id/render", requireAuth, aiActionRateLimiter, validateFinalPdfRenderRequest, asyncHandler(pdfController.renderFinalPdf));

export { router as pdfRoutes };
