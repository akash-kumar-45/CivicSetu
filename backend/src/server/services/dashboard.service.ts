import prisma from "../db";
import { LedgerService } from "./ledger.service";
import { ReviewsService } from "./reviews.service";

export class DashboardService {
  private db: typeof prisma;
  private ledgerService: LedgerService;
  private reviewsService: ReviewsService;

  constructor(
    customDb?: typeof prisma,
    customLedger?: LedgerService,
    customReviews?: ReviewsService
  ) {
    this.db = customDb || prisma;
    this.ledgerService = customLedger || new LedgerService(this.db);
    this.reviewsService = customReviews || new ReviewsService(this.db);
  }

  async verifyActiveMembership(userId: string, groupId: string): Promise<boolean> {
    const membership = await this.db.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    return !!membership && membership.status === "ACTIVE";
  }

  async verifyGroupAdmin(userId: string, groupId: string): Promise<boolean> {
    const membership = await this.db.membership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
      include: { user: true },
    });

    return !!membership && membership.status === "ACTIVE" && membership.user.role === "ADMIN";
  }

  /**
   * Transparent aggregate stats for a cooperative group.
   * Visible to all active members of the group.
   */
  async getGroupDashboard(callerUserId: string, groupId: string) {
    const isActive = await this.verifyActiveMembership(callerUserId, groupId);
    if (!isActive) {
      throw new Error("Forbidden: You must be an active member of this group to view stats");
    }

    const group = await this.db.coopGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new Error("Cooperative group not found");
    }

    // Active members count
    const activeMembersCount = await this.db.membership.count({
      where: { groupId, status: "ACTIVE" },
    });

    // Completed bookings count
    const completedBookingsCount = await this.db.booking.count({
      where: {
        listing: { groupId },
        status: { in: ["COMPLETED", "REVIEWED"] },
      },
    });

    // Total credits in circulation from group ledger entries
    const ledgerEntries = await this.db.ledgerEntry.findMany({
      where: { groupId },
      select: { amount: true },
    });

    const creditsInCirculation = ledgerEntries.reduce(
      (sum: number, entry: { amount: number }) => sum + entry.amount,
      0
    );

    // Active listings count
    const activeListingsCount = await this.db.listing.count({
      where: { groupId, active: true },
    });

    return {
      group: {
        id: group.id,
        name: group.name,
        locality: group.locality,
      },
      stats: {
        activeMembers: activeMembersCount,
        completedBookings: completedBookingsCount,
        creditsInCirculation,
        activeListings: activeListingsCount,
        totalTransactions: ledgerEntries.length,
      },
    };
  }

  /**
   * Member's own ledger view and profile stats.
   * Access control: Visible ONLY to the member themselves and group admins.
   */
  async getMemberDashboard(
    callerUserId: string,
    targetUserId: string,
    groupId?: string
  ) {
    if (callerUserId !== targetUserId) {
      if (!groupId) {
        throw new Error("Forbidden: You can only view your own ledger history");
      }
      const isAdmin = await this.verifyGroupAdmin(callerUserId, groupId);
      if (!isAdmin) {
        throw new Error("Forbidden: Only group admins or the member can view individual ledger history");
      }
    }

    const balance = await this.ledgerService.getUserBalance(targetUserId, groupId);
    const ledgerHistory = await this.ledgerService.getUserLedgerHistory(targetUserId, groupId);
    const ratingSummary = await this.reviewsService.getUserRatingSummary(targetUserId);

    const user = await this.db.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return {
      user,
      balance,
      ratingSummary,
      ledgerHistory,
    };
  }
}

export const dashboardService = new DashboardService();
