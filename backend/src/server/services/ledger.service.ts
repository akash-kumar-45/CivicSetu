import prisma from "../db";

export class LedgerService {
  private db: typeof prisma;

  constructor(customDb?: typeof prisma) {
    this.db = customDb || prisma;
  }

  /**
   * Derive balance dynamically from append-only ledger entries.
   * Balances are never stored as a mutable number.
   * balance = total_received - total_sent
   */
  async getUserBalance(userId: string, groupId?: string): Promise<number> {
    const receivedEntries = await this.db.ledgerEntry.findMany({
      where: {
        toUserId: userId,
        ...(groupId ? { groupId } : {}),
      },
      select: { amount: true },
    });

    const sentEntries = await this.db.ledgerEntry.findMany({
      where: {
        fromUserId: userId,
        ...(groupId ? { groupId } : {}),
      },
      select: { amount: true },
    });

    const totalReceived = receivedEntries.reduce((sum: number, entry: { amount: number }) => sum + entry.amount, 0);
    const totalSent = sentEntries.reduce((sum: number, entry: { amount: number }) => sum + entry.amount, 0);

    return totalReceived - totalSent;
  }

  /**
   * Grant initial welcome/treasury credits to a newly approved member
   * to bootstrap participation in the time bank.
   */
  async grantInitialCredits(
    adminUserId: string,
    groupId: string,
    targetUserId: string,
    amount: number
  ) {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error("Credit amount must be a positive integer");
    }

    // Verify admin status
    const adminMembership = await this.db.membership.findUnique({
      where: {
        userId_groupId: {
          userId: adminUserId,
          groupId,
        },
      },
      include: { user: true },
    });

    if (!adminMembership || adminMembership.status !== "ACTIVE" || adminMembership.user.role !== "ADMIN") {
      throw new Error("Forbidden: Only group admins can grant initial credits");
    }

    const grantBookingId = `grant_${groupId}_${targetUserId}_${Date.now()}`;

    // Create a system booking entry placeholder for ledger traceability
    return this.db.$transaction(async (tx: any) => {
      // Create ledger entry
      const entry = await tx.ledgerEntry.create({
        data: {
          groupId,
          fromUserId: adminUserId,
          toUserId: targetUserId,
          amount,
          bookingId: grantBookingId,
        },
      });

      return entry;
    });
  }

  /**
   * Get user's personal ledger history for audit and transparency.
   * Visible only to the user themselves and group admins.
   */
  async getUserLedgerHistory(userId: string, groupId?: string) {
    const entries = await this.db.ledgerEntry.findMany({
      where: {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
        ...(groupId ? { groupId } : {}),
      },
      include: {
        fromUser: { select: { id: true, name: true, email: true } },
        toUser: { select: { id: true, name: true, email: true } },
        group: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return entries.map((entry: any) => ({
      id: entry.id,
      groupId: entry.groupId,
      groupName: entry.group?.name,
      amount: entry.amount,
      type: entry.toUserId === userId ? "CREDIT" : "DEBIT",
      counterparty:
        entry.toUserId === userId ? entry.fromUser : entry.toUser,
      bookingId: entry.bookingId,
      createdAt: entry.createdAt,
    }));
  }

  /**
   * Aggregate statistics for group dashboard
   */
  async getGroupLedgerStats(groupId: string) {
    const entries = await this.db.ledgerEntry.findMany({
      where: { groupId },
      select: { amount: true },
    });

    const totalCirculatingCredits = entries.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);
    const totalTransactions = entries.length;

    return {
      totalCirculatingCredits,
      totalTransactions,
    };
  }
}

export const ledgerService = new LedgerService();
