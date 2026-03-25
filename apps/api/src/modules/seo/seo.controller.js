import { sendSuccess } from "../../utils/apiResponse.js";
import { seoService } from "./seo.service.js";

export const seoController = {
  async getHome(_req, res) {
    const index = await seoService.getDiscoveryIndex();
    return sendSuccess(res, index, "Public home SEO data fetched successfully.");
  },
  async getSitemapData(_req, res) {
    const urls = await seoService.getSiteMapData();
    return sendSuccess(res, { urls }, "Sitemap data fetched successfully.");
  },
  async getLandingPage(req, res) {
    const payload = await seoService.getLandingPage(req.params.type, req.params.slug);
    return sendSuccess(res, payload, "Public SEO landing page fetched successfully.");
  },
  async getDiscoveryIndex(_req, res) {
    const payload = await seoService.getDiscoveryIndex();
    return sendSuccess(res, payload, "Public discovery index fetched successfully.");
  },
  async getSitemapXml(_req, res) {
    const urls = await seoService.getSiteMapData();
    res.type("application/xml");
    return res.send(seoService.buildSitemapXml(urls));
  },
  getRobotsTxt(_req, res) {
    res.type("text/plain");
    return res.send(seoService.buildRobotsTxt());
  },
};
