import { Router } from "express";
import { marketplaceController } from "./marketplace.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth, requireDeveloperMode } from "../../middleware/auth.middleware.js";
import { aiActionRateLimiter } from "../../middleware/index.js";
import { validateMarketplaceListing, validateMarketplaceListingUpdate } from "../../validators/index.js";

const router = Router();

router.get("/public/listings", asyncHandler(marketplaceController.getPublicListings));
router.get("/public/listings/:slug", asyncHandler(marketplaceController.getListingDetail));
router.get("/eligible-pdfs", requireAuth, requireDeveloperMode, asyncHandler(marketplaceController.getEligibleGeneratedPdfs));
router.get("/my-listings", requireAuth, requireDeveloperMode, asyncHandler(marketplaceController.getMyListings));
router.post(
  "/listings",
  requireAuth,
  requireDeveloperMode,
  aiActionRateLimiter,
  validateMarketplaceListing,
  asyncHandler(marketplaceController.createListing),
);
router.patch(
  "/listings/:id",
  requireAuth,
  requireDeveloperMode,
  aiActionRateLimiter,
  validateMarketplaceListingUpdate,
  asyncHandler(marketplaceController.updateListing),
);

export { router as marketplaceRoutes };
