import { Notification, User } from "../models/index.js";

function serializeNotification(record) {
  return {
    id: record._id.toString(),
    userId: record.userId?.toString?.() || null,
    type: record.type,
    title: record.title,
    message: record.message,
    channel: record.channel || "in_app",
    isRead: Boolean(record.isRead),
    actionUrl: record.actionUrl || "",
    metadata: record.metadata || {},
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

async function createNotification(payload) {
  const notification = await Notification.create({
    userId: payload.userId,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    channel: payload.channel || "in_app",
    isRead: false,
    actionUrl: payload.actionUrl || "",
    metadata: payload.metadata || {},
  });

  return serializeNotification(notification);
}

export const notificationService = {
  serializeNotification,

  async create(payload) {
    return createNotification(payload);
  },

  async notifyAdmins(payload) {
    const admins = await User.find({
      role: "admin",
      isBlocked: false,
      status: { $ne: "blocked" },
    }).select("_id");

    if (!admins.length) {
      return [];
    }

    const notifications = await Notification.insertMany(
      admins.map((admin) => ({
        userId: admin._id,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        channel: payload.channel || "in_app",
        isRead: false,
        actionUrl: payload.actionUrl || "",
        metadata: payload.metadata || {},
      })),
    );

    return notifications.map(serializeNotification);
  },

  async listForUser(userId, query = {}) {
    const limit = Math.min(Math.max(Number(query.limit) || 30, 1), 100);
    const filter = { userId };

    if (query.unread === "true") {
      filter.isRead = false;
    }
    if (query.type) {
      filter.type = query.type;
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(limit);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return {
      items: notifications.map(serializeNotification),
      unreadCount,
    };
  },

  async markAsRead(userId, notificationId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return null;
    }

    return serializeNotification(notification);
  },

  async markAllAsRead(userId) {
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    return this.listForUser(userId, { limit: 30 });
  },
};
