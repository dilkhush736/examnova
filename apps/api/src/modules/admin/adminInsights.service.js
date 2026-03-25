import {
  AdminUploadedPdf,
  AuditLog,
  GeneratedPdf,
  MarketplaceListing,
  Notification,
  Payment,
  Purchase,
  UpcomingLockedPdf,
  UploadedDocument,
  User,
  WithdrawalRequest,
} from "../../models/index.js";

function serializeAuditLog(record) {
  return {
    id: record._id.toString(),
    actorId: record.actorId?._id?.toString?.() || record.actorId?.toString?.() || null,
    actorName: record.actorId?.name || "",
    actorRole: record.actorRole || "",
    action: record.action,
    entityType: record.entityType,
    entityId: record.entityId?.toString?.() || null,
    before: record.before || null,
    after: record.after || null,
    ipAddress: record.ipAddress || "",
    requestId: record.requestId || "",
    createdAt: record.createdAt,
  };
}

function serializeModerationListing(item) {
  return {
    id: item._id.toString(),
    title: item.title,
    slug: item.slug,
    sellerId: item.sellerId?._id?.toString?.() || item.sellerId?.toString?.() || null,
    sellerName: item.sellerId?.name || item.sellerId?.sellerProfile?.displayName || "ExamNova Seller",
    sourceType: item.sourceType || "generated_pdf",
    visibility: item.visibility,
    isPublished: Boolean(item.isPublished),
    moderationStatus: item.moderationStatus || "clear",
    approvalStatus: item.approvalStatus || "approved",
    taxonomy: item.taxonomy,
    salesCount: item.salesCount || 0,
    viewCount: item.viewCount || 0,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function buildTimeFilter(days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff;
}

async function getPurchaseTaxonomyGroups(groupField) {
  return Purchase.aggregate([
    { $match: { status: "completed" } },
    {
      $lookup: {
        from: "marketplace_listings",
        localField: "listingId",
        foreignField: "_id",
        as: "listing",
      },
    },
    { $unwind: "$listing" },
    {
      $group: {
        _id: `$listing.taxonomy.${groupField}`,
        purchases: { $sum: 1 },
        revenue: { $sum: "$amountInr" },
      },
    },
    { $match: { _id: { $ne: null, $ne: "" } } },
    { $sort: { purchases: -1, revenue: -1 } },
    { $limit: 6 },
  ]);
}

export const adminInsightsService = {
  async getAnalyticsOverview() {
    const activeCutoff = buildTimeFilter(30);

    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      blockedUsers,
      totalUploadedDocuments,
      totalGeneratedPdfs,
      totalAdminUploads,
      totalMarketplaceListings,
      totalPublishedListings,
      totalPurchases,
      paymentStatusRows,
      marketplaceRevenueRows,
      pendingWithdrawalRows,
      completedPayoutRows,
      totalUpcomingLockedPdfs,
      semesterContentRows,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLoginAt: { $gte: activeCutoff }, isBlocked: false }),
      User.countDocuments({ isEmailVerified: true }),
      User.countDocuments({ $or: [{ isBlocked: true }, { status: "blocked" }] }),
      UploadedDocument.countDocuments(),
      GeneratedPdf.countDocuments(),
      AdminUploadedPdf.countDocuments(),
      MarketplaceListing.countDocuments(),
      MarketplaceListing.countDocuments({ isPublished: true, visibility: "published" }),
      Purchase.countDocuments({ status: "completed" }),
      Payment.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            amount: { $sum: "$amountInr" },
          },
        },
      ]),
      Payment.aggregate([
        { $match: { status: "paid", contextType: "marketplace" } },
        {
          $group: {
            _id: null,
            totalMarketplaceRevenue: { $sum: "$amountInr" },
            totalAdminEarnings: { $sum: "$adminCommissionAmount" },
            totalSellerEarnings: { $sum: "$sellerEarningAmount" },
          },
        },
      ]),
      WithdrawalRequest.aggregate([
        { $match: { status: "pending" } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            amount: { $sum: "$amountInr" },
          },
        },
      ]),
      WithdrawalRequest.aggregate([
        { $match: { status: "paid" } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            amount: { $sum: "$amountInr" },
          },
        },
      ]),
      UpcomingLockedPdf.countDocuments({ status: "upcoming", visibility: true }),
      MarketplaceListing.aggregate([
        { $match: { visibility: "published" } },
        {
          $group: {
            _id: "$taxonomy.semester",
            listings: { $sum: 1 },
          },
        },
        { $sort: { listings: -1 } },
        { $limit: 6 },
      ]),
    ]);

    const paymentStatusMap = paymentStatusRows.reduce((accumulator, row) => {
      accumulator[row._id || "unknown"] = {
        count: row.count,
        amount: row.amount,
      };
      return accumulator;
    }, {});

    const marketplaceRevenue = marketplaceRevenueRows[0] || {
      totalMarketplaceRevenue: 0,
      totalAdminEarnings: 0,
      totalSellerEarnings: 0,
    };
    const pendingWithdrawals = pendingWithdrawalRows[0] || { count: 0, amount: 0 };
    const completedPayouts = completedPayoutRows[0] || { count: 0, amount: 0 };

    return {
      metrics: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        blockedUsers,
        totalUploadedDocuments,
        totalGeneratedPdfs,
        totalAdminUploads,
        totalMarketplaceListings,
        totalPublishedListings,
        totalPurchases,
        successfulPayments: paymentStatusMap.paid?.count || 0,
        failedPayments: paymentStatusMap.failed?.count || 0,
        pendingPayments: paymentStatusMap.pending?.count || 0,
        totalMarketplaceRevenue: marketplaceRevenue.totalMarketplaceRevenue || 0,
        totalAdminEarnings: marketplaceRevenue.totalAdminEarnings || 0,
        totalSellerEarnings: marketplaceRevenue.totalSellerEarnings || 0,
        totalPendingWithdrawals: pendingWithdrawals.count || 0,
        totalPendingWithdrawalAmount: pendingWithdrawals.amount || 0,
        totalCompletedPayouts: completedPayouts.count || 0,
        totalCompletedPayoutAmount: completedPayouts.amount || 0,
        totalUpcomingLockedPdfs,
      },
      semesterContentCounts: semesterContentRows.map((row) => ({
        semester: row._id || "Unspecified",
        listings: row.listings,
      })),
    };
  },

  async getTrendAnalytics() {
    const [
      popularUniversities,
      popularBranches,
      popularSemesters,
      popularSubjects,
      topSellingPdfs,
      topViewedListings,
      mostPurchasedCategories,
    ] = await Promise.all([
      getPurchaseTaxonomyGroups("university"),
      getPurchaseTaxonomyGroups("branch"),
      getPurchaseTaxonomyGroups("semester"),
      getPurchaseTaxonomyGroups("subject"),
      MarketplaceListing.find({ visibility: "published" })
        .sort({ salesCount: -1, viewCount: -1 })
        .limit(6)
        .select("title slug salesCount viewCount taxonomy priceInr"),
      MarketplaceListing.find({ visibility: "published" })
        .sort({ viewCount: -1, salesCount: -1 })
        .limit(6)
        .select("title slug salesCount viewCount taxonomy priceInr"),
      Purchase.aggregate([
        { $match: { status: "completed" } },
        {
          $lookup: {
            from: "marketplace_listings",
            localField: "listingId",
            foreignField: "_id",
            as: "listing",
          },
        },
        { $unwind: "$listing" },
        {
          $group: {
            _id: {
              university: "$listing.taxonomy.university",
              subject: "$listing.taxonomy.subject",
            },
            purchases: { $sum: 1 },
          },
        },
        { $sort: { purchases: -1 } },
        { $limit: 6 },
      ]),
    ]);

    return {
      popularUniversities: popularUniversities.map((row) => ({
        label: row._id,
        purchases: row.purchases,
        revenue: row.revenue,
      })),
      popularBranches: popularBranches.map((row) => ({
        label: row._id,
        purchases: row.purchases,
        revenue: row.revenue,
      })),
      popularSemesters: popularSemesters.map((row) => ({
        label: row._id,
        purchases: row.purchases,
        revenue: row.revenue,
      })),
      popularSubjects: popularSubjects.map((row) => ({
        label: row._id,
        purchases: row.purchases,
        revenue: row.revenue,
      })),
      topSellingPdfs: topSellingPdfs.map((item) => ({
        id: item._id.toString(),
        title: item.title,
        slug: item.slug,
        salesCount: item.salesCount || 0,
        viewCount: item.viewCount || 0,
        priceInr: item.priceInr || 0,
        taxonomy: item.taxonomy,
      })),
      topViewedListings: topViewedListings.map((item) => ({
        id: item._id.toString(),
        title: item.title,
        slug: item.slug,
        salesCount: item.salesCount || 0,
        viewCount: item.viewCount || 0,
        priceInr: item.priceInr || 0,
        taxonomy: item.taxonomy,
      })),
      mostPurchasedAcademicCategories: mostPurchasedCategories.map((row) => ({
        university: row._id.university || "Unspecified",
        subject: row._id.subject || "Unspecified",
        purchases: row.purchases,
      })),
      searchTrendPlaceholders: [],
    };
  },

  async getAlerts() {
    const failedPaymentCutoff = buildTimeFilter(30);

    const [
      pendingWithdrawals,
      failedPaymentUsers,
      riskyUsers,
      flaggedListings,
      overdueUpcoming,
      adminNotifications,
    ] = await Promise.all([
      WithdrawalRequest.find({ status: "pending" })
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(6),
      Payment.aggregate([
        { $match: { status: "failed", createdAt: { $gte: failedPaymentCutoff } } },
        {
          $group: {
            _id: "$userId",
            attempts: { $sum: 1 },
            amount: { $sum: "$amountInr" },
          },
        },
        { $match: { attempts: { $gte: 3 } } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        { $sort: { attempts: -1 } },
        { $limit: 6 },
      ]),
      User.find({
        $or: [{ "authMeta.failedLoginCount": { $gte: 3 } }, { isBlocked: true }],
      })
        .sort({ updatedAt: -1 })
        .limit(6)
        .select("name email role isBlocked authMeta status"),
      MarketplaceListing.find({
        moderationStatus: { $in: ["suspicious", "restricted"] },
      })
        .populate("sellerId", "name")
        .sort({ updatedAt: -1 })
        .limit(6),
      UpcomingLockedPdf.find({
        status: "upcoming",
        expectedReleaseAt: { $lt: new Date() },
      })
        .sort({ expectedReleaseAt: 1 })
        .limit(6),
      Notification.find({ type: { $in: ["admin_alert", "withdrawal_created"] } })
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    return {
      summary: {
        pendingWithdrawalAlerts: pendingWithdrawals.length,
        repeatedFailedPaymentAlerts: failedPaymentUsers.length,
        riskyUserAlerts: riskyUsers.length,
        flaggedListingAlerts: flaggedListings.length,
        overdueUpcomingAlerts: overdueUpcoming.length,
      },
      pendingWithdrawals: pendingWithdrawals.map((item) => ({
        id: item._id.toString(),
        userName: item.userId?.name || "",
        userEmail: item.userId?.email || "",
        amountInr: item.amountInr,
        requestedAt: item.requestedAt,
        status: item.status,
      })),
      repeatedFailedPayments: failedPaymentUsers.map((item) => ({
        userId: item._id?.toString?.() || null,
        userName: item.user?.name || "Unknown user",
        email: item.user?.email || "",
        attempts: item.attempts,
        amountInr: item.amount,
      })),
      riskyUsers: riskyUsers.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        email: item.email,
        failedLoginCount: item.authMeta?.failedLoginCount || 0,
        isBlocked: Boolean(item.isBlocked),
        status: item.status,
      })),
      flaggedListings: flaggedListings.map(serializeModerationListing),
      overdueUpcoming: overdueUpcoming.map((item) => ({
        id: item._id.toString(),
        title: item.title,
        slug: item.slug,
        expectedReleaseAt: item.expectedReleaseAt,
        taxonomy: item.taxonomy,
        status: item.status,
      })),
      recentAdminAlerts: adminNotifications.map((item) => ({
        id: item._id.toString(),
        title: item.title,
        message: item.message,
        type: item.type,
        createdAt: item.createdAt,
      })),
    };
  },

  async listAuditLogs(query = {}) {
    const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 200);
    const filter = {};

    if (query.action) {
      filter.action = query.action;
    }
    if (query.entityType) {
      filter.entityType = query.entityType;
    }
    if (query.days) {
      filter.createdAt = { $gte: buildTimeFilter(Number(query.days) || 30) };
    }

    const logs = await AuditLog.find(filter)
      .populate("actorId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit);

    const search = String(query.search || "").trim().toLowerCase();
    const filtered = search
      ? logs.filter((item) =>
          [item.action, item.entityType, item.actorId?.name, item.actorId?.email]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(search)),
        )
      : logs;

    return {
      items: filtered.map(serializeAuditLog),
    };
  },

  async listModerationQueue(query = {}) {
    const filter = {};

    if (query.flaggedOnly === "true") {
      filter.moderationStatus = { $in: ["suspicious", "restricted"] };
    } else if (query.moderationStatus) {
      filter.moderationStatus = query.moderationStatus;
    }

    if (query.search) {
      filter.$or = [
        { title: new RegExp(String(query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
        { slug: new RegExp(String(query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
      ];
    }

    const items = await MarketplaceListing.find(filter)
      .populate("sellerId", "name")
      .sort({ updatedAt: -1 })
      .limit(100);

    return {
      items: items.map(serializeModerationListing),
    };
  },
};
