import { createStorageClient, hashToken } from "../../lib/index.js";
import { MarketplaceListing, Purchase } from "../../models/index.js";
import { ApiError } from "../../utils/ApiError.js";

const storageClient = createStorageClient();

function serializePurchase(record) {
  return {
    id: record._id.toString(),
    buyerId: record.buyerId?._id?.toString?.() || record.buyerId?.toString?.() || null,
    buyerMode: record.buyerMode || "account",
    buyerName: record.guestBuyerName || record.buyerId?.name || "",
    sellerId: record.sellerId?._id?.toString?.() || record.sellerId?.toString?.() || null,
    sellerName: record.sellerId?.sellerProfile?.displayName || record.sellerId?.name || "ExamNova Seller",
    listingId: record.listingId?._id?.toString?.() || record.listingId?.toString?.() || null,
    generatedPdfId: record.generatedPdfId?._id?.toString?.() || record.generatedPdfId?.toString?.() || null,
    title: record.listingId?.title || "Purchased PDF",
    slug: record.listingId?.slug || "",
    amountInr: record.amountInr,
    currency: record.currency || "INR",
    status: record.status,
    paymentStatus: record.paymentStatus || "paid",
    adminCommissionAmount: record.adminCommissionAmount || 0,
    sellerEarningAmount: record.sellerEarningAmount || 0,
    buyerAccessState: record.buyerAccessState || "granted",
    accessGrantedAt: record.accessGrantedAt,
    purchasedAt: record.createdAt,
    taxonomy: record.listingId?.taxonomy || null,
    studyMetadata: record.listingId?.studyMetadata || {},
  };
}

async function findDownloadableListing(listingId) {
  return MarketplaceListing.findById(listingId)
    .populate("sourcePdfId")
    .populate("adminUploadId");
}

async function buildPurchaseDownloadFile(listing) {
  const storageKey = listing?.sourceType === "admin_upload"
    ? listing?.adminUploadId?.storageKey
    : listing?.sourcePdfId?.storageKey;

  if (!storageKey) {
    throw new ApiError(404, "Purchased PDF file is not available.");
  }

  let absolutePath;

  try {
    absolutePath = await storageClient.resolveExisting(storageKey);
  } catch {
    throw new ApiError(
      404,
      listing?.sourceType === "admin_upload"
        ? "This purchased PDF file is missing on the server. Please re-upload the admin PDF and republish the listing."
        : "This purchased PDF file is missing on the server. Please regenerate the PDF and try again.",
    );
  }

  return {
    absolutePath,
    downloadName:
      (listing?.sourceType === "admin_upload"
        ? listing?.adminUploadId?.originalName
        : listing?.sourcePdfId?.pdfDownloadName) ||
      `${listing.title.replace(/\s+/g, "-").toLowerCase()}.pdf`,
  };
}

export const purchaseService = {
  serializePurchase,

  async listBuyerPurchases(userId) {
    const purchases = await Purchase.find({
      buyerId: userId,
      status: "completed",
      buyerAccessState: "granted",
    })
      .populate("listingId", "title slug taxonomy studyMetadata priceInr")
      .populate("sellerId", "name sellerProfile")
      .sort({ createdAt: -1 });

    return purchases.map(serializePurchase);
  },

  async getBuyerPurchase(userId, purchaseId) {
    const purchase = await Purchase.findOne({
      _id: purchaseId,
      buyerId: userId,
      status: "completed",
      buyerAccessState: "granted",
    })
      .populate("listingId", "title slug taxonomy studyMetadata priceInr sourcePdfId")
      .populate("sellerId", "name sellerProfile");

    if (!purchase) {
      throw new ApiError(404, "Purchased PDF not found in your library.");
    }

    return serializePurchase(purchase);
  },

  async getPurchaseDownload(userId, purchaseId) {
    const purchase = await Purchase.findOne({
      _id: purchaseId,
      buyerId: userId,
      status: "completed",
      buyerAccessState: "granted",
    }).populate("listingId");

    if (!purchase) {
      throw new ApiError(404, "Purchased PDF not found in your library.");
    }

    const listing = await findDownloadableListing(purchase.listingId?._id || purchase.listingId);
    return buildPurchaseDownloadFile(listing);
  },

  async getGuestPurchaseDownload(purchaseId, guestToken) {
    const normalizedToken = String(guestToken || "").trim();
    if (!normalizedToken) {
      throw new ApiError(401, "Guest download token is required.");
    }

    const purchase = await Purchase.findOne({
      _id: purchaseId,
      buyerMode: "guest",
      status: "completed",
      buyerAccessState: "granted",
    }).populate("listingId");

    if (!purchase) {
      throw new ApiError(404, "Guest purchase not found.");
    }

    if (!purchase.guestAccessTokenHash || !purchase.guestAccessExpiresAt) {
      throw new ApiError(403, "Guest download access is not active for this purchase.");
    }

    if (purchase.guestAccessExpiresAt.getTime() < Date.now()) {
      throw new ApiError(403, "Guest download access has expired. Please use the latest purchase success screen.");
    }

    if (hashToken(normalizedToken) !== purchase.guestAccessTokenHash) {
      throw new ApiError(403, "Guest download token is invalid.");
    }

    const listing = await findDownloadableListing(purchase.listingId?._id || purchase.listingId);
    return buildPurchaseDownloadFile(listing);
  },
};
