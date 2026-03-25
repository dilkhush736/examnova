import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../constants/db.constants.js";

const otpVerificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    email: { type: String, required: true, index: true },
    purpose: { type: String, required: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attemptCount: { type: Number, default: 0 },
    resendCount: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: Date.now },
    verifiedAt: { type: Date },
    status: { type: String, default: "pending", index: true },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAMES.OTP_VERIFICATIONS,
  },
);

otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpVerification =
  mongoose.models.OtpVerification || mongoose.model("OtpVerification", otpVerificationSchema);
