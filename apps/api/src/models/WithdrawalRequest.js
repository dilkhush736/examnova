import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../constants/db.constants.js";

const payoutDetailsSchema = new mongoose.Schema(
  {
    accountHolderName: { type: String, default: "", trim: true },
    upiId: { type: String, default: "", trim: true },
    bankAccountNumber: { type: String, default: "", trim: true },
    ifscCode: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const withdrawalRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amountInr: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, default: "pending", index: true },
    payoutMethod: { type: String, default: "upi", enum: ["upi", "bank_account", "manual"], index: true },
    accountReference: { type: String, default: "", trim: true },
    payoutDetails: { type: payoutDetailsSchema, default: () => ({}) },
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
