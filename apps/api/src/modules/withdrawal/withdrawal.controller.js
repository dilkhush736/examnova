import { sendSuccess } from "../../utils/apiResponse.js";
import { withdrawalService } from "./withdrawal.service.js";

export const withdrawalController = {
  async listWithdrawals(req, res) {
    const items = await withdrawalService.listWithdrawals(req.auth.userId);
    return sendSuccess(res, { items }, "Withdrawal requests fetched successfully.");
  },
  async getWithdrawal(req, res) {
    const item = await withdrawalService.getWithdrawal(req.auth.userId, req.params.id);
    return sendSuccess(res, { item }, "Withdrawal request fetched successfully.");
  },
  async createWithdrawal(req, res) {
    const item = await withdrawalService.createWithdrawal(req.auth.userId, req.body);
    return sendSuccess(res, { item }, "Withdrawal request created successfully.", 201);
  },
  async cancelWithdrawal(req, res) {
    const item = await withdrawalService.cancelWithdrawal(req.auth.userId, req.params.id);
    return sendSuccess(res, { item }, "Withdrawal request cancelled successfully.");
  },
};
