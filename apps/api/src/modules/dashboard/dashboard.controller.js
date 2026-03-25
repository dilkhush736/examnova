import { sendSuccess } from "../../utils/apiResponse.js";
import { dashboardService } from "./dashboard.service.js";

export const dashboardController = {
  async getSummary(req, res) {
    const summary = await dashboardService.getSummary(req.user);
    return sendSuccess(res, { summary }, "Dashboard summary fetched successfully.");
  },

  async getActivityCounters(req, res) {
    const counters = await dashboardService.getActivityCounters(req.user);
    return sendSuccess(res, { counters }, "Activity counters fetched successfully.");
  },
};
