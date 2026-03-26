import { Router } from "express";
import { walletController } from "./wallet.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth, requireDeveloperMode } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, requireDeveloperMode, asyncHandler(walletController.getWallet));
router.get("/transactions", requireAuth, requireDeveloperMode, asyncHandler(walletController.getWalletTransactions));

export { router as walletRoutes };
