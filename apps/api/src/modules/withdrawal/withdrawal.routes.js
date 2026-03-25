import { Router } from "express";
import { withdrawalController } from "./withdrawal.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { paymentRateLimiter } from "../../middleware/index.js";
import { validateWithdrawalRequest } from "../../validators/index.js";

const router = Router();

router.get("/", requireAuth, asyncHandler(withdrawalController.listWithdrawals));
router.get("/:id", requireAuth, asyncHandler(withdrawalController.getWithdrawal));
router.post("/", requireAuth, paymentRateLimiter, validateWithdrawalRequest, asyncHandler(withdrawalController.createWithdrawal));
router.patch("/:id/cancel", requireAuth, asyncHandler(withdrawalController.cancelWithdrawal));

export { router as withdrawalRoutes };
