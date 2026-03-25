import { Router } from "express";
import { getHealth, getReadiness } from "../../controllers/health.controller.js";

const router = Router();

router.get("/", getHealth);
router.get("/readiness", getReadiness);

export { router as healthRoutes };
