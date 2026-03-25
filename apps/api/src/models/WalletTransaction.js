import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../constants/db.constants.js";

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, default: null },
    type: { type: String, required: true, index: true },
    direction: { type: String, required: true },
    amountInr: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    sourceType: { type: String, required: true },
    sourceId: { type: mongoose.Schema.Types.ObjectId, index: true },
    balanceAfter: { type: Number, default: 0 },
    status: { type: String, default: "posted", index: true },
    note: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAMES.WALLET_TRANSACTIONS,
  },
);

export const WalletTransaction =
  mongoose.models.WalletTransaction ||
  mongoose.model("WalletTransaction", walletTransactionSchema);
