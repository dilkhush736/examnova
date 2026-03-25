import { Router } from "express";
import { paymentController } from "./payment.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { paymentRateLimiter } from "../../middleware/index.js";
import {
  validateMarketplaceOrderRequest,
  validatePaymentVerification,
  validatePrivatePdfOrderRequest,
} from "../../validators/index.js";

const router = Router();

router.post(
  "/private-pdf-order",
  requireAuth,
  paymentRateLimiter,
  validatePrivatePdfOrderRequest,
  asyncHandler(paymentController.createPrivatePdfOrder),
);
router.get(
  "/private-pdf/:generationId/status",
  requireAuth,
  asyncHandler(paymentController.getPrivatePdfPaymentStatus),
);
router.post(
  "/private-pdf-verify",
  requireAuth,
  paymentRateLimiter,
  validatePaymentVerification,
  asyncHandler(paymentController.verifyPrivatePdfPayment),
);
router.post(
  "/marketplace-order",
  requireAuth,
  paymentRateLimiter,
  validateMarketplaceOrderRequest,
  asyncHandler(paymentController.createMarketplaceOrder),
);
router.post(
  "/marketplace-verify",
  requireAuth,
  paymentRateLimiter,
  validatePaymentVerification,
  asyncHandler(paymentController.verifyMarketplacePayment),
);
router.post("/verify", requireAuth, paymentRateLimiter, validatePaymentVerification, asyncHandler(paymentController.handleWebhook));
router.post("/webhook", asyncHandler(paymentController.handleWebhook));

export { router as paymentRoutes };
