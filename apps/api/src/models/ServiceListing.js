import mongoose from "mongoose";
import { COLLECTION_NAMES } from "../constants/db.constants.js";
import { SERVICE_LISTING_CATEGORIES } from "../constants/app.constants.js";

const serviceListingSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, enum: SERVICE_LISTING_CATEGORIES, required: true, index: true },
    shortDescription: { type: String, default: "" },
    details: { type: String, default: "" },
    techStack: [{ type: String, trim: true }],
    demoUrl: { type: String, default: "" },
    repoUrl: { type: String, default: "" },
    priceInr: { type: Number, required: true },
    offerPriceInr: { type: Number, default: 0 },
    imageStorageKey: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    zipStorageKey: { type: String, default: "" },
    zipFileName: { type: String, default: "" },
    zipMimeType: { type: String, default: "" },
    visibility: { type: String, default: "draft", index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    searchText: { type: String, default: "", index: true },
    viewCount: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAMES.SERVICE_LISTINGS,
  },
);

serviceListingSchema.index({ category: 1, isFeatured: -1, publishedAt: -1 });
serviceListingSchema.index({ visibility: 1, isDeleted: 1, publishedAt: -1 });

export const ServiceListing =
  mongoose.models.ServiceListing ||
  mongoose.model("ServiceListing", serviceListingSchema);
