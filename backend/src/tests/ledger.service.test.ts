import { describe, it, expect, vi, beforeEach } from "vitest";
import { LedgerService } from "../server/services/ledger.service";
import { BookingsService } from "../server/services/bookings.service";

describe("Time-Credit Ledger & Atomic Booking Completion", () => {
  let mockDb: any;
  let ledgerService: LedgerService;
  let bookingsService: BookingsService;

  beforeEach(() => {
    mockDb = {
      ledgerEntry: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
      membership: {
        findUnique: vi.fn(),
      },
      booking: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn(async (callback: any) => {
        return callback(mockDb);
      }),
    };

    ledgerService = new LedgerService(mockDb);
    bookingsService = new BookingsService(mockDb, ledgerService);
  });

  describe("Balance Calculation", () => {
    it("should correctly derive balance from sum of received minus sum of sent entries", async () => {
      // User received 10 and 5 credits
      mockDb.ledgerEntry.findMany
        .mockResolvedValueOnce([{ amount: 10 }, { amount: 5 }]) // received = 15
        .mockResolvedValueOnce([{ amount: 4 }]); // sent = 4

      const balance = await ledgerService.getUserBalance("user-1");
      expect(balance).toBe(11); // 15 - 4 = 11
    });

    it("should return zero balance when no transactions exist", async () => {
      mockDb.ledgerEntry.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const balance = await ledgerService.getUserBalance("new-user");
      expect(balance).toBe(0);
    });
  });

  describe("Atomic Booking Completion & Solvency Guards", () => {
    it("should successfully complete booking and post LedgerEntry atomically", async () => {
      const pastDate = new Date(Date.now() - 3600000); // 1 hour ago
      const bookingData = {
        id: "booking-10",
        providerId: "provider-1",
        requesterId: "requester-1",
        status: "ACCEPTED",
        startsAt: pastDate,
        durationMinutes: 60,
        creditAmount: 2,
        listing: { groupId: "group-100" },
      };

      mockDb.booking.findUnique.mockResolvedValue(bookingData);

      // Requester has 5 credits balance (enough to pay 2 credits)
      vi.spyOn(ledgerService, "getUserBalance").mockResolvedValue(5);

      mockDb.booking.update.mockResolvedValue({
        ...bookingData,
        status: "COMPLETED",
      });

      mockDb.ledgerEntry.create.mockResolvedValue({
        id: "ledger-entry-1",
        groupId: "group-100",
        fromUserId: "requester-1",
        toUserId: "provider-1",
        amount: 2,
        bookingId: "booking-10",
        createdAt: new Date(),
      });

      const result = await bookingsService.completeBooking("provider-1", "booking-10");

      expect(result.booking.status).toBe("COMPLETED");
      expect(result.ledgerEntry.amount).toBe(2);
      expect(mockDb.$transaction).toHaveBeenCalled();
      expect(mockDb.ledgerEntry.create).toHaveBeenCalledWith({
        data: {
          groupId: "group-100",
          fromUserId: "requester-1",
          toUserId: "provider-1",
          amount: 2,
          bookingId: "booking-10",
        },
      });
    });

    it("should reject completion if requester has insufficient balance (balance cannot go negative)", async () => {
      const pastDate = new Date(Date.now() - 3600000);
      mockDb.booking.findUnique.mockResolvedValue({
        id: "booking-10",
        providerId: "provider-1",
        requesterId: "requester-poor",
        status: "ACCEPTED",
        startsAt: pastDate,
        durationMinutes: 60,
        creditAmount: 5,
        listing: { groupId: "group-100" },
      });

      // Requester only has 2 credits
      vi.spyOn(ledgerService, "getUserBalance").mockResolvedValue(2);

      await expect(
        bookingsService.completeBooking("provider-1", "booking-10")
      ).rejects.toThrow("Insufficient credit balance: Requester has 2 credits, but 5 credits are required.");

      expect(mockDb.ledgerEntry.create).not.toHaveBeenCalled();
    });

    it("should reject completion if startsAt has not passed yet", async () => {
      const futureDate = new Date(Date.now() + 3600000); // 1 hour in future
      mockDb.booking.findUnique.mockResolvedValue({
        id: "booking-10",
        providerId: "provider-1",
        requesterId: "requester-1",
        status: "ACCEPTED",
        startsAt: futureDate,
        durationMinutes: 60,
        creditAmount: 2,
        listing: { groupId: "group-100" },
      });

      await expect(
        bookingsService.completeBooking("provider-1", "booking-10")
      ).rejects.toThrow("Cannot complete booking: start time has not passed yet");

      expect(mockDb.ledgerEntry.create).not.toHaveBeenCalled();
    });

    it("should reject double-completion and post nothing on the second attempt", async () => {
      const pastDate = new Date(Date.now() - 3600000);
      // Already completed booking
      mockDb.booking.findUnique.mockResolvedValue({
        id: "booking-10",
        providerId: "provider-1",
        requesterId: "requester-1",
        status: "COMPLETED",
        startsAt: pastDate,
        creditAmount: 2,
        listing: { groupId: "group-100" },
      });

      await expect(
        bookingsService.completeBooking("provider-1", "booking-10")
      ).rejects.toThrow("Invalid state transition: Cannot complete a booking with status COMPLETED");

      expect(mockDb.ledgerEntry.create).not.toHaveBeenCalled();
    });
  });
});
