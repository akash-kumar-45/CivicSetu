import { describe, it, expect, vi, beforeEach } from "vitest";
import { DashboardService } from "../server/services/dashboard.service";

describe("DashboardService", () => {
  let mockDb: any;
  let mockLedger: any;
  let mockReviews: any;
  let dashboardService: DashboardService;

  beforeEach(() => {
    mockDb = {
      membership: {
        findUnique: vi.fn(),
        count: vi.fn(),
      },
      coopGroup: {
        findUnique: vi.fn(),
      },
      booking: {
        count: vi.fn(),
      },
      listing: {
        count: vi.fn(),
      },
      ledgerEntry: {
        findMany: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
    };

    mockLedger = {
      getUserBalance: vi.fn().mockResolvedValue(10),
      getUserLedgerHistory: vi.fn().mockResolvedValue([]),
    };

    mockReviews = {
      getUserRatingSummary: vi.fn().mockResolvedValue({ averageRating: 4.8, totalReviews: 5 }),
    };

    dashboardService = new DashboardService(mockDb, mockLedger, mockReviews);
  });

  describe("getGroupDashboard", () => {
    it("should return group totals when caller is an ACTIVE member", async () => {
      mockDb.membership.findUnique.mockResolvedValue({ status: "ACTIVE" });
      mockDb.coopGroup.findUnique.mockResolvedValue({
        id: "group-100",
        name: "Eco Cooperative",
        locality: "Green Valley",
      });
      mockDb.membership.count.mockResolvedValue(15);
      mockDb.booking.count.mockResolvedValue(8);
      mockDb.listing.count.mockResolvedValue(12);
      mockDb.ledgerEntry.findMany.mockResolvedValue([
        { amount: 5 },
        { amount: 3 },
      ]);

      const res = await dashboardService.getGroupDashboard("user-active", "group-100");

      expect(res.stats.activeMembers).toBe(15);
      expect(res.stats.completedBookings).toBe(8);
      expect(res.stats.creditsInCirculation).toBe(8);
      expect(res.stats.activeListings).toBe(12);
      expect(res.stats.totalTransactions).toBe(2);
    });

    it("should reject group totals access when caller is NOT an active member", async () => {
      mockDb.membership.findUnique.mockResolvedValue({ status: "PENDING" });

      await expect(
        dashboardService.getGroupDashboard("user-pending", "group-100")
      ).rejects.toThrow("Forbidden: You must be an active member of this group to view stats");
    });
  });

  describe("getMemberDashboard (Individual History Access Control)", () => {
    it("should allow a member to view their own ledger history", async () => {
      mockDb.user.findUnique.mockResolvedValue({
        id: "user-1",
        name: "Alice",
        email: "alice@coop.local",
        role: "MEMBER",
      });

      const res = await dashboardService.getMemberDashboard("user-1", "user-1");
      expect(res.user?.id).toBe("user-1");
      expect(res.balance).toBe(10);
      expect(mockLedger.getUserLedgerHistory).toHaveBeenCalledWith("user-1", undefined);
    });

    it("should allow group admin to view another member's history", async () => {
      mockDb.membership.findUnique.mockResolvedValue({
        userId: "admin-1",
        groupId: "group-100",
        status: "ACTIVE",
        user: { role: "ADMIN" },
      });

      mockDb.user.findUnique.mockResolvedValue({
        id: "user-target",
        name: "Target User",
        email: "target@coop.local",
      });

      const res = await dashboardService.getMemberDashboard("admin-1", "user-target", "group-100");
      expect(res.user?.id).toBe("user-target");
    });

    it("should forbid a non-admin member from viewing another member's ledger history", async () => {
      mockDb.membership.findUnique.mockResolvedValue({
        userId: "user-normal",
        groupId: "group-100",
        status: "ACTIVE",
        user: { role: "MEMBER" }, // Not an admin!
      });

      await expect(
        dashboardService.getMemberDashboard("user-normal", "user-target", "group-100")
      ).rejects.toThrow("Forbidden: Only group admins or the member can view individual ledger history");
    });
  });
});
