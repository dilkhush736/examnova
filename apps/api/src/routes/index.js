import { Router } from "express";
import { API_PREFIX } from "../constants/app.constants.js";
import { healthRoutes } from "../modules/health/health.routes.js";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { dashboardRoutes } from "../modules/dashboard/dashboard.routes.js";
import { profileRoutes } from "../modules/profile/profile.routes.js";
import { uploadRoutes } from "../modules/upload/upload.routes.js";
import { aiRoutes } from "../modules/ai/ai.routes.js";
import { pdfRoutes } from "../modules/pdf/pdf.routes.js";
import { paymentRoutes } from "../modules/payment/payment.routes.js";
import { purchaseRoutes } from "../modules/purchase/purchase.routes.js";
import { marketplaceRoutes } from "../modules/marketplace/marketplace.routes.js";
import { notificationRoutes } from "../modules/notification/notification.routes.js";
import { walletRoutes } from "../modules/wallet/wallet.routes.js";
import { withdrawalRoutes } from "../modules/withdrawal/withdrawal.routes.js";
import { adminRoutes } from "../modules/admin/admin.routes.js";
import { adminContentRoutes } from "../modules/admin-content/adminContent.routes.js";
import { seoRoutes } from "../modules/seo/seo.routes.js";
import { seoController } from "../modules/seo/seo.controller.js";
import { publicRoutes } from "../modules/public/public.routes.js";
import { serviceCatalogRoutes } from "../modules/service-catalog/serviceCatalog.routes.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export function registerRoutes(app) {
  const apiRouter = Router();

  app.get("/robots.txt", asyncHandler(seoController.getRobotsTxt));
  app.get("/sitemap.xml", asyncHandler(seoController.getSitemapXml));
  app.use("/health", healthRoutes);
  apiRouter.use("/health", healthRoutes);
  apiRouter.use("/auth", authRoutes);
  apiRouter.use("/dashboard", dashboardRoutes);
  apiRouter.use("/profile", profileRoutes);
  apiRouter.use("/uploads", uploadRoutes);
  apiRouter.use("/ai", aiRoutes);
  apiRouter.use("/pdfs", pdfRoutes);
  apiRouter.use("/payments", paymentRoutes);
  apiRouter.use("/library", purchaseRoutes);
  apiRouter.use("/marketplace", marketplaceRoutes);
  apiRouter.use("/notifications", notificationRoutes);
  apiRouter.use("/wallet", walletRoutes);
  apiRouter.use("/withdrawals", withdrawalRoutes);
  apiRouter.use("/admin", adminRoutes);
  apiRouter.use("/admin-content", adminContentRoutes);
  apiRouter.use("/public", seoRoutes);
  apiRouter.use("/public", publicRoutes);
  apiRouter.use("/services", serviceCatalogRoutes);

  app.use(API_PREFIX, apiRouter);
}
