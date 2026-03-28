import {
  AuditLog,
  ServiceListing,
} from "../../models/index.js";
import { createStorageClient } from "../../lib/index.js";
import { ApiError } from "../../utils/ApiError.js";
import { buildPublicMediaUrl } from "../../utils/publicAssetUrl.js";
import { slugify } from "../../utils/slugify.js";

const storageClient = createStorageClient();
const SERVICE_VISIBILITY = new Set(["draft", "published", "unlisted", "archived"]);

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function ensureVisibility(visibility) {
  const normalized = normalizeText(visibility || "draft").toLowerCase();
  if (!SERVICE_VISIBILITY.has(normalized)) {
    throw new ApiError(422, "visibility must be draft, published, unlisted, or archived.");
  }
  return normalized;
}

function buildSearchText(record) {
  return [
    record.title,
    record.category,
    record.shortDescription,
    record.details,
    ...(record.techStack || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function resolveImageUrl(record, req) {
  return buildPublicMediaUrl(req, record?.imageStorageKey, record?.imageUrl || "");
}

function buildPricing(record) {
  const basePriceInr = Number(record.priceInr || 0);
  const offerPriceInr = Number(record.offerPriceInr || 0);
  const currentPriceInr = offerPriceInr > 0 && offerPriceInr < basePriceInr ? offerPriceInr : basePriceInr;
  const discountPercent =
    offerPriceInr > 0 && offerPriceInr < basePriceInr
      ? Math.round(((basePriceInr - offerPriceInr) / basePriceInr) * 100)
      : 0;

  return {
    basePriceInr,
    offerPriceInr,
    currentPriceInr,
    discountPercent,
  };
}

async function buildUniqueSlug(baseText, excludeId = null) {
  const baseSlug = slugify(baseText) || `service-${Date.now()}`;
  let candidate = baseSlug;
  let counter = 2;

  while (true) {
    const existing = await ServiceListing.findOne({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).select("_id");

    if (!existing) {
      return candidate;
    }

    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

async function createAuditLog(action, actor, req, entityId, after) {
  await AuditLog.create({
    actorId: actor?._id || actor?.id || null,
    actorRole: actor?.role || "",
    action,
    entityType: "ServiceListing",
    entityId,
    requestId: req?.context?.requestId || "",
    ipAddress: req?.ip || req?.headers?.["x-forwarded-for"] || "",
    after,
  });
}

export function serializeServiceListing(record, req = null, { includePrivate = false } = {}) {
  return {
    id: record._id.toString(),
    adminId: record.adminId?._id?.toString?.() || record.adminId?.toString?.() || null,
    adminName: record.adminId?.name || "ExamNova Admin",
    title: record.title,
    slug: record.slug,
    category: record.category,
    shortDescription: record.shortDescription || "",
    details: record.details || "",
    techStack: record.techStack || [],
    demoUrl: record.demoUrl || "",
    repoUrl: includePrivate ? record.repoUrl || "" : "",
    pricing: buildPricing(record),
    imageUrl: resolveImageUrl(record, req),
    visibility: record.visibility,
    isFeatured: Boolean(record.isFeatured),
    seoTitle: record.seoTitle || "",
    seoDescription: record.seoDescription || "",
    viewCount: record.viewCount || 0,
    salesCount: record.salesCount || 0,
    hasDownloadPackage: Boolean(record.zipStorageKey),
    zipFileName: includePrivate ? record.zipFileName || "" : "",
    publishedAt: record.publishedAt || null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export const serviceCatalogService = {
  async listAdminServices(req) {
    const items = await ServiceListing.find({ isDeleted: { $ne: true } })
      .populate("adminId", "name")
      .sort({ createdAt: -1 });

    return items.map((item) => serializeServiceListing(item, req, { includePrivate: true }));
  },

  async createAdminService({ actor, payload, req, imageFile, zipFile }) {
    if (!imageFile) {
      throw new ApiError(422, "A service image is required.");
    }
    if (!zipFile) {
      throw new ApiError(422, "A ZIP file is required.");
    }

    const uploadedImage = await storageClient.upload({
      originalName: imageFile.originalname,
      buffer: imageFile.buffer,
      ownerDirectory: "service-listing-images",
    });
    const uploadedZip = await storageClient.upload({
      originalName: zipFile.originalname,
      buffer: zipFile.buffer,
      ownerDirectory: "service-listing-zips",
    });

    const visibility = ensureVisibility(payload.visibility);

    const item = await ServiceListing.create({
      adminId: actor.id || actor._id,
      title: payload.title,
      slug: await buildUniqueSlug(`${payload.title}-${payload.category}`),
      category: payload.category,
      shortDescription: payload.shortDescription,
      details: payload.details,
      techStack: payload.techStack || [],
      demoUrl: payload.demoUrl,
      repoUrl: payload.repoUrl || "",
      priceInr: payload.priceInr,
      offerPriceInr: payload.offerPriceInr || 0,
      imageStorageKey: uploadedImage.storageKey,
      imageUrl: "",
      zipStorageKey: uploadedZip.storageKey,
      zipFileName: zipFile.originalname,
      zipMimeType: zipFile.mimetype,
      visibility,
      isFeatured: Boolean(payload.isFeatured),
      seoTitle: payload.seoTitle || payload.title,
      seoDescription: payload.seoDescription || payload.shortDescription,
      searchText: buildSearchText(payload),
      publishedAt: visibility === "published" ? new Date() : null,
    });

    await createAuditLog("service_listing_created", actor, req, item._id.toString(), {
      title: item.title,
      visibility: item.visibility,
    });

    const populated = await ServiceListing.findById(item._id).populate("adminId", "name");
    return serializeServiceListing(populated, req, { includePrivate: true });
  },

  async updateAdminService(serviceId, actor, payload, req, imageFile = null, zipFile = null) {
    const item = await ServiceListing.findById(serviceId).populate("adminId", "name");
    if (!item || item.isDeleted) {
      throw new ApiError(404, "Service listing not found.");
    }

    if (imageFile) {
      try {
        if (item.imageStorageKey) {
          await storageClient.remove(item.imageStorageKey);
        }
      } catch {
        // keep update flow resilient if old file is already missing
      }
      const uploadedImage = await storageClient.upload({
        originalName: imageFile.originalname,
        buffer: imageFile.buffer,
        ownerDirectory: "service-listing-images",
      });
      item.imageStorageKey = uploadedImage.storageKey;
      item.imageUrl = "";
    }

    if (zipFile) {
      try {
        if (item.zipStorageKey) {
          await storageClient.remove(item.zipStorageKey);
        }
      } catch {
        // keep update flow resilient if old file is already missing
      }
      const uploadedZip = await storageClient.upload({
        originalName: zipFile.originalname,
        buffer: zipFile.buffer,
        ownerDirectory: "service-listing-zips",
      });
      item.zipStorageKey = uploadedZip.storageKey;
      item.zipFileName = zipFile.originalname;
      item.zipMimeType = zipFile.mimetype;
    }

    item.title = payload.title;
    item.slug = await buildUniqueSlug(`${payload.title}-${payload.category}`, item._id);
    item.category = payload.category;
    item.shortDescription = payload.shortDescription;
    item.details = payload.details;
    item.techStack = payload.techStack || [];
    item.demoUrl = payload.demoUrl;
    item.repoUrl = payload.repoUrl || "";
    item.priceInr = payload.priceInr;
    item.offerPriceInr = payload.offerPriceInr || 0;
    item.visibility = ensureVisibility(payload.visibility || item.visibility);
    item.isFeatured = Boolean(payload.isFeatured);
    item.seoTitle = payload.seoTitle || payload.title;
    item.seoDescription = payload.seoDescription || payload.shortDescription;
    item.searchText = buildSearchText(payload);
    item.publishedAt = item.visibility === "published" ? item.publishedAt || new Date() : null;
    await item.save();

    await createAuditLog("service_listing_updated", actor, req, item._id.toString(), {
      title: item.title,
      visibility: item.visibility,
    });

    return serializeServiceListing(item, req, { includePrivate: true });
  },

  async deleteAdminService(serviceId, actor, req) {
    const item = await ServiceListing.findById(serviceId);
    if (!item || item.isDeleted) {
      throw new ApiError(404, "Service listing not found.");
    }

    item.isDeleted = true;
    item.deletedAt = new Date();
    item.visibility = "archived";
    await item.save();

    await createAuditLog("service_listing_deleted", actor, req, item._id.toString(), {
      title: item.title,
    });

    return {
      id: item._id.toString(),
      title: item.title,
    };
  },

  async listPublicServices(query = {}, req = null) {
    const conditions = {
      isDeleted: { $ne: true },
      visibility: "published",
    };

    const search = normalizeText(query.search).toLowerCase();
    if (search) {
      conditions.searchText = {
        $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    }

    const category = normalizeText(query.category).toLowerCase();
    if (category) {
      conditions.category = category;
    }

    const items = await ServiceListing.find(conditions)
      .sort({ isFeatured: -1, publishedAt: -1, createdAt: -1 });

    return items.map((item) => serializeServiceListing(item, req));
  },

  async getPublicServiceDetail(slug, req = null) {
    const item = await ServiceListing.findOne({
      slug,
      isDeleted: { $ne: true },
      visibility: "published",
    });

    if (!item) {
      throw new ApiError(404, "Service listing not found.");
    }

    item.viewCount = (item.viewCount || 0) + 1;
    await item.save();

    return serializeServiceListing(item, req);
  },

  async getPurchasableService(serviceId, req = null) {
    const item = await ServiceListing.findOne({
      _id: serviceId,
      isDeleted: { $ne: true },
      visibility: "published",
    });

    if (!item) {
      throw new ApiError(404, "Website service is not available for purchase.");
    }

    if (!item.zipStorageKey) {
      throw new ApiError(400, "This website service does not have a downloadable ZIP package.");
    }

    return serializeServiceListing(item, req, { includePrivate: true });
  },
};
