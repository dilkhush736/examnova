import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../constants/db.constants.js";

const withdrawalRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amountInr: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, default: "pending", index: true },
    payoutMethod: { type: String, default: "manual" },
    accountReference: { type: String, default: "" },
    payoutDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
    userNote: { type: String, default: "" },
    requestedAt: { type: Date, default: Date.now },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    adminNote: { type: String, default: "" },
    payoutReference: { type: String, default: "" },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    paidAt: { type: Date },
    cancelledAt: { type: Date },
    holdTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: "WalletTransaction" },
    releaseTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: "WalletTransaction" },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAMES.WITHDRAWAL_REQUESTS,
  },
);

export const WithdrawalRequest =
  mongoose.models.WithdrawalRequest ||
  mongoose.model("WithdrawalRequest", withdrawalRequestSchema);
