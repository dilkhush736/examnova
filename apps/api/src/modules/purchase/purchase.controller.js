import { sendSuccess } from "../../utils/apiResponse.js";
import { purchaseService } from "./purchase.service.js";

export const purchaseController = {
  async listBuyerPurchases(req, res) {
    const items = await purchaseService.listBuyerPurchases(req.auth.userId);
    return sendSuccess(res, { items }, "Buyer library fetched successfully.");
  },
  async getBuyerPurchase(req, res) {
    const purchase = await purchaseService.getBuyerPurchase(req.auth.userId, req.params.id);
    return sendSuccess(res, { purchase }, "Purchased PDF detail fetched successfully.");
  },
  async downloadBuyerPurchase(req, res) {
    const file = await purchaseService.getPurchaseDownload(req.auth.userId, req.params.id);
    return res.download(file.absolutePath, file.downloadName);
  },
};
