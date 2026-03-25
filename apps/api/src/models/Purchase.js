import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../constants/db.constants.js";

const purchaseSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    purchaseType: { type: String, required: true, index: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "MarketplaceListing" },
    generatedPdfId: { type: mongoose.Schema.Types.ObjectId, ref: "GeneratedPdf" },
    adminUploadId: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUploadedPdf" },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
    amountInr: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    paymentStatus: { type: String, default: "paid", index: true },
    status: { type: String, default: "completed", index: true },
    adminCommissionAmount: { type: Number, default: 0 },
    sellerEarningAmount: { type: Number, default: 0 },
    buyerAccessState: { type: String, default: "granted", index: true },
    accessGrantedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAMES.PURCHASES,
  },
);

purchaseSchema.index({ buyerId: 1, purchaseType: 1, targetId: 1 }, { unique: true });
purchaseSchema.index({ buyerId: 1, listingId: 1 }, { unique: true, sparse: true });

export const Purchase = mongoose.models.Purchase || mongoose.model("Purchase", purchaseSchema);
