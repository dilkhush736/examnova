import { WalletTransaction } from "../../models/index.js";
import { WithdrawalRequest } from "../../models/index.js";

function serializeTransaction(record) {
  return {
    id: record._id.toString(),
    userId: record.userId?.toString?.() || null,
    type: record.type,
    direction: record.direction,
    amountInr: record.amountInr,
    sourceType: record.sourceType,
    sourceId: record.sourceId?.toString?.() || null,
    balanceAfter: record.balanceAfter || 0,
    status: record.status,
    note: record.note || "",
    createdAt: record.createdAt,
  };
}

export const walletService = {
  async getWalletSnapshot(userId) {
    const [summaryRows, pendingWithdrawalRows, lifetimeEarningsRows, withdrawnRows] = await Promise.all([
      WalletTransaction.aggregate([
        { $match: { userId, status: "posted" } },
        {
          $group: {
            _id: null,
            credits: { $sum: { $cond: [{ $eq: ["$direction", "credit"] }, "$amountInr", 0] } },
            debits: { $sum: { $cond: [{ $eq: ["$direction", "debit"] }, "$amountInr", 0] } },
          },
        },
      ]),
      WithdrawalRequest.aggregate([
        { $match: { userId, status: "pending" } },
        { $group: { _id: null, total: { $sum: "$amountInr" } } },
      ]),
      WalletTransaction.aggregate([
        { $match: { userId, type: "marketplace_sale_credit", direction: "credit", status: "posted" } },
        { $group: { _id: null, total: { $sum: "$amountInr" } } },
      ]),
      WithdrawalRequest.aggregate([
        { $match: { userId, status: { $in: ["approved", "paid"] } } },
        { $group: { _id: null, total: { $sum: "$amountInr" } } },
      ]),
    ]);

    const summary = summaryRows[0] || { credits: 0, debits: 0 };
    const pending = pendingWithdrawalRows[0]?.total || 0;
    const lifetimeEarnings = lifetimeEarningsRows[0]?.total || 0;
    const totalWithdrawn = withdrawnRows[0]?.total || 0;

    return {
      availableBalance: summary.credits - summary.debits,
      pendingWithdrawalAmount: pending,
      totalCredits: summary.credits,
      totalDebits: summary.debits,
      lifetimeEarnings,
      totalWithdrawn,
      currency: "INR",
    };
  },

  async listTransactions(userId) {
    const transactions = await WalletTransaction.find({ userId, status: "posted" }).sort({ createdAt: -1 }).limit(50);
    return transactions.map(serializeTransaction);
  },

  async getWallet(userId) {
    const [snapshot, transactions] = await Promise.all([
      this.getWalletSnapshot(userId),
      this.listTransactions(userId),
    ]);

    return {
      ...snapshot,
      transactions,
    };
  },
};
