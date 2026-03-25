import {
  GeneratedPdf,
  MarketplaceListing,
  Notification,
  Purchase,
  WithdrawalRequest,
} from "../../models/index.js";
import { walletService } from "../wallet/wallet.service.js";

function getProfileCompletion(user) {
  const checkpoints = [
    Boolean(user.name),
    Boolean(user.email),
    Boolean(user.phone),
    Boolean(user.academicProfile?.university),
    Boolean(user.academicProfile?.branch),
    Boolean(user.academicProfile?.semester),
    Boolean(user.bio),
  ];

  const completed = checkpoints.filter(Boolean).length;
  return Math.round((completed / checkpoints.length) * 100);
}

export const dashboardService = {
  async getSummary(user) {
    const [
      generatedPdfsCount,
      purchasedPdfsCount,
      listedPdfsCount,
      unreadNotificationsCount,
      withdrawalRequestsCount,
      latestNotifications,
      walletSummary,
    ] = await Promise.all([
      GeneratedPdf.countDocuments({ userId: user._id }),
      Purchase.countDocuments({ buyerId: user._id, status: "completed" }),
      MarketplaceListing.countDocuments({ sellerId: user._id }),
      Notification.countDocuments({ userId: user._id, isRead: false }),
      WithdrawalRequest.countDocuments({ userId: user._id }),
      Notification.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5).lean(),
      walletService.getWalletSnapshot(user._id),
    ]);

    return {
      overview: {
        welcomeName: user.name,
        profileCompletionPercent: getProfileCompletion(user),
        accountStatus: user.status,
        emailVerified: user.isEmailVerified,
      },
      counters: {
        generatedPdfs: generatedPdfsCount,
        purchasedPdfs: purchasedPdfsCount,
        listedPdfs: listedPdfsCount,
        unreadNotifications: unreadNotificationsCount,
        withdrawalRequests: withdrawalRequestsCount,
      },
      wallet: {
        availableBalance: walletSummary.availableBalance,
        pendingWithdrawalAmount: walletSummary.pendingWithdrawalAmount,
        totalCredits: walletSummary.totalCredits,
        totalDebits: walletSummary.totalDebits,
        lifetimeEarnings: walletSummary.lifetimeEarnings,
        totalWithdrawn: walletSummary.totalWithdrawn,
        currency: "INR",
      },
      latestActivity: latestNotifications.map((item) => ({
        id: item._id.toString(),
        type: item.type,
        title: item.title,
        createdAt: item.createdAt,
        isRead: item.isRead,
      })),
      sections: {
        generatedPdfs: {
          count: generatedPdfsCount,
          emptyMessage: "Generated PDFs will appear here after the PDF engine goes live.",
        },
        purchasedPdfs: {
          count: purchasedPdfsCount,
          emptyMessage: "Purchased marketplace PDFs will appear here.",
        },
        listedPdfs: {
          count: listedPdfsCount,
          emptyMessage: "Your marketplace listings will appear here.",
        },
        payments: {
          count: 0,
          emptyMessage: "Payment history will appear here once payment flows are implemented.",
        },
        notifications: {
          count: unreadNotificationsCount,
          emptyMessage: "You are all caught up for now.",
        },
      },
    };
  },

  async getActivityCounters(user) {
    const [generatedPdfsCount, purchasedPdfsCount, listedPdfsCount, notificationsCount] =
      await Promise.all([
        GeneratedPdf.countDocuments({ userId: user._id }),
        Purchase.countDocuments({ buyerId: user._id, status: "completed" }),
        MarketplaceListing.countDocuments({ sellerId: user._id }),
        Notification.countDocuments({ userId: user._id }),
      ]);

    return {
      generatedPdfs: generatedPdfsCount,
      purchasedPdfs: purchasedPdfsCount,
      listedPdfs: listedPdfsCount,
      notifications: notificationsCount,
    };
  },
};
