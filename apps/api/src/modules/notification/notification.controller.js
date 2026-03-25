import { sendSuccess } from "../../utils/apiResponse.js";
import { notificationService } from "../../services/notification.service.js";
import { ApiError } from "../../utils/ApiError.js";

export const notificationController = {
  async listNotifications(req, res) {
    const payload = await notificationService.listForUser(req.auth.userId, req.query);
    return sendSuccess(res, payload, "Notifications fetched successfully.");
  },
  async markNotificationRead(req, res) {
    const item = await notificationService.markAsRead(req.auth.userId, req.params.id);
    if (!item) {
      throw new ApiError(404, "Notification not found.");
    }
    return sendSuccess(res, { item }, "Notification marked as read.");
  },
  async markAllNotificationsRead(req, res) {
    const payload = await notificationService.markAllAsRead(req.auth.userId);
    return sendSuccess(res, payload, "All notifications marked as read.");
  },
};
