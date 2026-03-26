import { sendSuccess } from "../../utils/apiResponse.js";
import { adminService } from "./admin.service.js";
import { adminInsightsService } from "./adminInsights.service.js";

export const adminController = {
  async getDashboard(_req, res) {
    const summary = await adminService.getDashboardSummary();
    return sendSuccess(res, summary, "Admin dashboard summary fetched successfully.");
  },
  async getAnalyticsOverview(_req, res) {
    const payload = await adminInsightsService.getAnalyticsOverview();
    return sendSuccess(res, payload, "Admin analytics overview fetched successfully.");
  },
  async getTrendAnalytics(_req, res) {
    const payload = await adminInsightsService.getTrendAnalytics();
    return sendSuccess(res, payload, "Admin trend analytics fetched successfully.");
  },
  async getAlerts(_req, res) {
    const payload = await adminInsightsService.getAlerts();
    return sendSuccess(res, payload, "Admin alerts fetched successfully.");
  },
  async listAuditLogs(req, res) {
    const payload = await adminInsightsService.listAuditLogs(req.query);
    return sendSuccess(res, payload, "Admin audit logs fetched successfully.");
  },
  async listModerationQueue(req, res) {
    const payload = await adminInsightsService.listModerationQueue(req.query);
    return sendSuccess(res, payload, "Admin moderation queue fetched successfully.");
  },
  async listUsers(req, res) {
    const items = await adminService.listUsers(req.query);
    return sendSuccess(res, { items }, "Admin users fetched successfully.");
  },
  async getUser(req, res) {
    const payload = await adminService.getUser(req.params.id);
    return sendSuccess(res, payload, "Admin user detail fetched successfully.");
  },
  async updateUserStatus(req, res) {
    const user = await adminService.updateUserStatus(req.params.id, req.body, req.user, req);
    return sendSuccess(res, { user }, "Admin user status updated successfully.");
  },
  async listListings(req, res) {
    const items = await adminService.listListings(req.query);
    return sendSuccess(res, { items }, "Admin marketplace listings fetched successfully.");
  },
  async updateListingStatus(req, res) {
    const listing = await adminService.updateListingStatus(req.params.id, req.body, req.user, req);
    return sendSuccess(res, { listing }, "Admin listing status updated successfully.");
  },
  async updateListingMetadata(req, res) {
    const listing = await adminService.updateListingMetadata(req.params.id, req.body, req.user, req);
    return sendSuccess(res, { listing }, "Admin listing metadata updated successfully.");
  },
  async deleteListing(req, res) {
    const item = await adminService.deleteListing(req.params.id, req.user, req);
    return sendSuccess(res, { item }, "Admin listing deleted successfully.");
  },
  async listPurchases(_req, res) {
    const items = await adminService.listPurchases();
    return sendSuccess(res, { items }, "Admin purchases fetched successfully.");
  },
  async listPayments(_req, res) {
    const items = await adminService.listPayments();
    return sendSuccess(res, { items }, "Admin payments fetched successfully.");
  },
  async listWithdrawals(_req, res) {
    const items = await adminService.listWithdrawals();
    return sendSuccess(res, { items }, "Admin withdrawals fetched successfully.");
  },
  async updateWithdrawalStatus(req, res) {
    const item = await adminService.updateWithdrawalStatus(req.params.id, req.body, req.user, req);
    return sendSuccess(res, { item }, "Admin withdrawal status updated successfully.");
  },
};
