import { Router } from "express";
import { seoController } from "./seo.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = Router();

router.get("/home", asyncHandler(seoController.getHome));
router.get("/sitemap-data", asyncHandler(seoController.getSitemapData));
router.get("/discovery-index", asyncHandler(seoController.getDiscoveryIndex));
router.get("/landing/:type/:slug", asyncHandler(seoController.getLandingPage));

export { router as seoRoutes };
