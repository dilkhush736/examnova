import { Router } from "express";
import { uploadController } from "./upload.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { singleDocumentUpload, uploadRateLimiter } from "../../middleware/index.js";
import { validateUploadRequest } from "../../validators/index.js";

const router = Router();

router.get("/", requireAuth, asyncHandler(uploadController.listUploads));
router.get("/:id", requireAuth, asyncHandler(uploadController.getUpload));
router.post("/", requireAuth, uploadRateLimiter, singleDocumentUpload, validateUploadRequest, asyncHandler(uploadController.createUpload));
router.post("/:id/retry-parsing", requireAuth, uploadRateLimiter, asyncHandler(uploadController.retryParsing));
router.delete("/:id", requireAuth, asyncHandler(uploadController.archiveUpload));

export { router as uploadRoutes };
