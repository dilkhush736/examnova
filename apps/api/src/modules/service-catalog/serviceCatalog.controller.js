import { sendSuccess } from "../../utils/apiResponse.js";
import { serviceCatalogService } from "./serviceCatalog.service.js";

export const serviceCatalogController = {
  async listPublicServices(req, res) {
    const items = await serviceCatalogService.listPublicServices(req.query, req);
    return sendSuccess(res, { items }, "Service catalog fetched successfully.");
  },
  async getPublicServiceDetail(req, res) {
    const item = await serviceCatalogService.getPublicServiceDetail(req.params.slug, req);
    return sendSuccess(res, { item }, "Service detail fetched successfully.");
  },
  async listAdminServices(req, res) {
    const items = await serviceCatalogService.listAdminServices(req);
    return sendSuccess(res, { items }, "Admin website services fetched successfully.");
  },
  async createAdminService(req, res) {
    const item = await serviceCatalogService.createAdminService({
      actor: req.user,
      payload: req.body,
      req,
      imageFile: req.files?.image?.[0] || null,
      zipFile: req.files?.zipFile?.[0] || null,
    });
    return sendSuccess(res, { item }, "Website service created successfully.", 201);
  },
  async updateAdminService(req, res) {
    const item = await serviceCatalogService.updateAdminService(
      req.params.id,
      req.user,
      req.body,
      req,
      req.files?.image?.[0] || null,
      req.files?.zipFile?.[0] || null,
    );
    return sendSuccess(res, { item }, "Website service updated successfully.");
  },
  async deleteAdminService(req, res) {
    const item = await serviceCatalogService.deleteAdminService(req.params.id, req.user, req);
    return sendSuccess(res, { item }, "Website service deleted successfully.");
  },
};
