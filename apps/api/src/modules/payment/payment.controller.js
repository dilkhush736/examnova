import { sendSuccess } from "../../utils/apiResponse.js";
import { paymentService } from "./payment.service.js";

export const paymentController = {
  async createPrivatePdfOrder(req, res) {
    const result = await paymentService.createPrivatePdfOrder(req.auth.userId, req.body.generationId);
    return sendSuccess(res, result, "Private PDF payment order created successfully.", 201);
  },
  async createMarketplaceOrder(req, res) {
    const result = await paymentService.createMarketplaceOrder(req.auth.userId, req.body.listingId);
    return sendSuccess(res, result, "Marketplace payment order created successfully.", 201);
  },
  async verifyPrivatePdfPayment(req, res) {
    const result = await paymentService.verifyPrivatePdfPayment(req.auth.userId, req.body);
    return sendSuccess(res, result, "Private PDF payment verified successfully.");
  },
  async verifyMarketplacePayment(req, res) {
    const result = await paymentService.verifyMarketplacePayment(req.auth.userId, req.body);
    return sendSuccess(res, result, "Marketplace payment verified successfully.");
  },
  async getPrivatePdfPaymentStatus(req, res) {
    const result = await paymentService.getPrivatePdfPaymentStatus(
      req.auth.userId,
      req.params.generationId,
    );
    return sendSuccess(res, result, "Private PDF payment status fetched successfully.");
  },
  handleWebhook(_req, res) {
    return sendSuccess(res, {}, "Webhook endpoint reserved for future Razorpay server callbacks.");
  },
};
