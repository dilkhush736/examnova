import { Router } from "express";
import { profileController } from "./profile.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validateProfileSettingsUpdate, validateProfileUpdate } from "../../validators/index.js";

const router = Router();

router.get("/me", requireAuth, asyncHandler(profileController.getMe));
router.patch("/me", requireAuth, validateProfileUpdate, asyncHandler(profileController.updateMe));
router.patch(
  "/me/settings",
  requireAuth,
  validateProfileSettingsUpdate,
  asyncHandler(profileController.updateSettings),
);

export { router as profileRoutes };
