import { Router } from "express";
import { withdrawalController } from "./withdrawal.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth, requireDeveloperMode } from "../../middleware/auth.middleware.js";
import { paymentRateLimiter } from "../../middleware/index.js";
import { validateWithdrawalRequest } from "../../validators/index.js";

const router = Router();

router.get("/", requireAuth, requireDeveloperMode, asyncHandler(withdrawalController.listWithdrawals));
router.get("/:id", requireAuth, requireDeveloperMode, asyncHandler(withdrawalController.getWithdrawal));
router.post(
  "/",
  requireAuth,
  requireDeveloperMode,
  paymentRateLimiter,
  validateWithdrawalRequest,
  asyncHandler(withdrawalController.createWithdrawal),
);
router.patch("/:id/cancel", requireAuth, requireDeveloperMode, asyncHandler(withdrawalController.cancelWithdrawal));

export { router as withdrawalRoutes };
