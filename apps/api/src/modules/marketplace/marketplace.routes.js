import { Router } from "express";
import { marketplaceController } from "./marketplace.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { aiActionRateLimiter } from "../../middleware/index.js";
import { validateMarketplaceListing, validateMarketplaceListingUpdate } from "../../validators/index.js";

const router = Router();

router.get("/public/listings", asyncHandler(marketplaceController.getPublicListings));
router.get("/public/listings/:slug", asyncHandler(marketplaceController.getListingDetail));
router.get("/eligible-pdfs", requireAuth, asyncHandler(marketplaceController.getEligibleGeneratedPdfs));
router.get("/my-listings", requireAuth, asyncHandler(marketplaceController.getMyListings));
router.post("/listings", requireAuth, aiActionRateLimiter, validateMarketplaceListing, asyncHandler(marketplaceController.createListing));
router.patch(
  "/listings/:id",
  requireAuth,
  aiActionRateLimiter,
  validateMarketplaceListingUpdate,
  asyncHandler(marketplaceController.updateListing),
);

export { router as marketplaceRoutes };
