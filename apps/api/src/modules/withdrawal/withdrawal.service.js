import { WalletTransaction, WithdrawalRequest } from "../../models/index.js";
import { ApiError } from "../../utils/ApiError.js";
import { walletService } from "../wallet/wallet.service.js";
import { notificationService } from "../../services/notification.service.js";

function serializeWithdrawal(record) {
  return {
    id: record._id.toString(),
    userId: record.userId?.toString?.() || null,
    amountInr: record.amountInr,
    currency: record.currency || "INR",
    status: record.status,
    payoutMethod: record.payoutMethod || "manual",
    accountReference: record.accountReference || "",
    payoutDetails: record.payoutDetails || {},
    userNote: record.userNote || "",
    adminNote: record.adminNote || "",
    payoutReference: record.payoutReference || "",
    requestedAt: record.requestedAt,
    approvedAt: record.approvedAt || null,
    rejectedAt: record.rejectedAt || null,
    paidAt: record.paidAt || null,
    cancelledAt: record.cancelledAt || null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

async function createLedgerEntry({ userId, amountInr, direction, sourceId, type, note }) {
  const snapshot = await walletService.getWalletSnapshot(userId);
  const nextBalance =
    direction === "credit"
      ? snapshot.availableBalance + amountInr
      : snapshot.availableBalance - amountInr;

  return WalletTransaction.create({
    userId,
    type,
    direction,
    amountInr,
    currency: "INR",
    sourceType: "withdrawal_request",
    sourceId,
    balanceAfter: nextBalance,
    note,
    status: "posted",
  });
}

export const withdrawalService = {
  serializeWithdrawal,

  async listWithdrawals(userId) {
    const items = await WithdrawalRequest.find({ userId }).sort({ createdAt: -1 });
    return items.map(serializeWithdrawal);
  },

  async getWithdrawal(userId, withdrawalId) {
    const item = await WithdrawalRequest.findOne({ _id: withdrawalId, userId });
    if (!item) {
      throw new ApiError(404, "Withdrawal request not found.");
    }
    return serializeWithdrawal(item);
  },

  async createWithdrawal(userId, payload) {
    const amountInr = Number(payload.amountInr);
    if (!Number.isFinite(amountInr) || amountInr <= 0) {
      throw new ApiError(422, "Withdrawal amount must be greater than zero.");
    }

    const wallet = await walletService.getWalletSnapshot(userId);
    if (amountInr > wallet.availableBalance) {
      throw new ApiError(400, "Requested amount exceeds available wallet balance.");
    }

    const pendingExisting = await WithdrawalRequest.countDocuments({
      userId,
      status: "pending",
    });
    if (pendingExisting >= 3) {
      throw new ApiError(400, "Resolve existing pending withdrawal requests before creating more.");
    }

    let withdrawal = await WithdrawalRequest.create({
      userId,
      amountInr,
      currency: "INR",
      status: "pending",
      payoutMethod: payload.payoutMethod || "manual",
      accountReference: payload.accountReference || "",
      payoutDetails: payload.payoutDetails || {},
      userNote: payload.userNote || "",
    });

    const holdTransaction = await createLedgerEntry({
      userId,
      amountInr,
      direction: "debit",
      sourceId: withdrawal._id,
      type: "withdrawal_hold",
      note: `Withdrawal request hold for Rs. ${amountInr}`,
    });

    withdrawal.holdTransactionId = holdTransaction._id;
    await withdrawal.save();

    await notificationService.create({
      userId,
      type: "withdrawal_created",
      title: "Withdrawal request submitted",
      message: `Your withdrawal request for Rs. ${amountInr} is now pending admin review.`,
      actionUrl: "/app/withdrawals",
      metadata: {
        withdrawalId: withdrawal._id.toString(),
        amountInr,
      },
    });
    await notificationService.notifyAdmins({
      type: "withdrawal_created",
      title: "New withdrawal request",
      message: `A seller submitted a withdrawal request for Rs. ${amountInr}.`,
      actionUrl: "/admin/withdrawals",
      metadata: {
        withdrawalId: withdrawal._id.toString(),
        userId: userId.toString(),
        amountInr,
      },
    });

    return serializeWithdrawal(withdrawal);
  },

  async cancelWithdrawal(userId, withdrawalId) {
    const withdrawal = await WithdrawalRequest.findOne({ _id: withdrawalId, userId });
    if (!withdrawal) {
      throw new ApiError(404, "Withdrawal request not found.");
    }

    if (withdrawal.status !== "pending") {
      throw new ApiError(400, "Only pending withdrawal requests can be cancelled.");
    }

    if (!withdrawal.releaseTransactionId) {
      const releaseTransaction = await createLedgerEntry({
        userId,
        amountInr: withdrawal.amountInr,
        direction: "credit",
        sourceId: withdrawal._id,
        type: "withdrawal_release",
        note: `Withdrawal request release for Rs. ${withdrawal.amountInr}`,
      });
      withdrawal.releaseTransactionId = releaseTransaction._id;
    }

    withdrawal.status = "cancelled";
    withdrawal.cancelledAt = new Date();
    await withdrawal.save();

    return serializeWithdrawal(withdrawal);
  },
};
