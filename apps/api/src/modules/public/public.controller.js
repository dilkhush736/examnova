import { sendSuccess } from "../../utils/apiResponse.js";
import { adminContentService } from "../admin-content/adminContent.service.js";

export const publicController = {
  getUniversityLanding(_req, res) {
    return sendSuccess(res, { items: [] }, "Public university landing stub is wired.");
  },
  getSubjectLanding(_req, res) {
    return sendSuccess(res, { items: [] }, "Public subject landing stub is wired.");
  },
  async listUpcomingLockedPdfs(req, res) {
    const items = await adminContentService.listUpcomingItems({ ...req.query, mode: "public" });
    return sendSuccess(res, { items }, "Upcoming locked PDFs fetched successfully.");
  },
  async getUpcomingLockedPdfDetail(req, res) {
    const item = await adminContentService.getUpcomingDetail(req.params.slug);
    return sendSuccess(res, { item }, "Upcoming locked PDF detail fetched successfully.");
  },
};
