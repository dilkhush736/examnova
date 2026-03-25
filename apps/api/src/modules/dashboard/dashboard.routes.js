import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { dashboardController } from "./dashboard.controller.js";

const router = Router();

router.get("/summary", requireAuth, asyncHandler(dashboardController.getSummary));
router.get("/activity-counters", requireAuth, asyncHandler(dashboardController.getActivityCounters));

export { router as dashboardRoutes };
