import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../constants/db.constants.js";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    type: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    channel: { type: String, default: "in_app" },
    isRead: { type: Boolean, default: false, index: true },
    actionUrl: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAMES.NOTIFICATIONS,
  },
);

export const Notification =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
