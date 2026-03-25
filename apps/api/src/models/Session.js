import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../constants/db.constants.js";

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true },
    deviceInfo: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    isRevoked: { type: Boolean, default: false, index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    replacedByTokenId: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAMES.SESSIONS,
  },
);

sessionSchema.index({ userId: 1, expiresAt: 1 });
sessionSchema.index({ tokenHash: 1 }, { unique: true });

export const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);
