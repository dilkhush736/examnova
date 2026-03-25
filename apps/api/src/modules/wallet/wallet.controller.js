import { sendSuccess } from "../../utils/apiResponse.js";
import { walletService } from "./wallet.service.js";

export const walletController = {
  async getWallet(req, res) {
    const wallet = await walletService.getWallet(req.auth.userId);
    return sendSuccess(res, { wallet }, "Wallet fetched successfully.");
  },
  async getWalletTransactions(req, res) {
    const items = await walletService.listTransactions(req.auth.userId);
    return sendSuccess(res, { items }, "Wallet transactions fetched successfully.");
  },
};
