import { Router } from "express";
import { walletController } from "./wallet.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, asyncHandler(walletController.getWallet));
router.get("/transactions", requireAuth, asyncHandler(walletController.getWalletTransactions));

export { router as walletRoutes };
