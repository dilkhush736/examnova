import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { purchaseController } from "./purchase.controller.js";

const router = Router();

router.get("/guest/:id/download", asyncHandler(purchaseController.downloadGuestPurchase));
router.get("/", requireAuth, asyncHandler(purchaseController.listBuyerPurchases));
router.get("/:id", requireAuth, asyncHandler(purchaseController.getBuyerPurchase));
router.get("/:id/download", requireAuth, asyncHandler(purchaseController.downloadBuyerPurchase));

export { router as purchaseRoutes };
