import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../constants/db.constants.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "student", index: true },
    status: { type: String, default: "pending_verification", index: true },
    isEmailVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false, index: true },
    blockedReason: { type: String, default: "" },
    lastLoginAt: { type: Date },
    phone: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    academicProfile: {
      university: { type: String, default: "" },
      branch: { type: String, default: "" },
      year: { type: String, default: "" },
      semester: { type: String, default: "" },
    },
    bio: { type: String, default: "" },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      productUpdates: { type: Boolean, default: true },
      marketplaceAlerts: { type: Boolean, default: true },
    },
    authMeta: {
      emailVerifiedAt: { type: Date },
      passwordChangedAt: { type: Date },
      lastOtpSentAt: { type: Date },
      failedLoginCount: { type: Number, default: 0 },
      lastFailedLoginAt: { type: Date },
      loginLockedUntil: { type: Date },
    },
    sellerProfile: {
      displayName: { type: String, default: "" },
      bio: { type: String, default: "" },
      payoutMethod: { type: String, default: "" },
      payoutReference: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAMES.USERS,
  },
);
export const User = mongoose.models.User || mongoose.model("User", userSchema);
