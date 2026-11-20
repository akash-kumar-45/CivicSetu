import { describe, it, expect, vi, beforeEach } from "vitest";
import { BookingsService } from "../server/services/bookings.service";

describe("BookingsService - State Machine & Overlap Rules", () => {
  let mockDb: any;
  let mockLedger: any;
  let bookingsService: BookingsService;

  beforeEach(() => {
    mockDb = {
      membership: {
        findUnique: vi.fn(),
      },
      listing: {
        findUnique: vi.fn(),
      },
      booking: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      ledgerEntry: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb: any) => cb(mockDb)),
    };

    mockLedger = {
      getUserBalance: vi.fn(),
    };

    bookingsService = new BookingsService(mockDb, mockLedger);
  });

  describe("createBookingRequest", () => {
    it("should create booking request when parties are active members", async () => {
      mockDb.listing.findUnique.mockResolvedValue({
        id: "listing-1",
        ownerId: "provider-1",
        groupId: "group-100",
        type: "OFFER",
        hourlyCredits: 2,
        active: true,
      });

      mockDb.membership.findUnique.mockResolvedValue({ status: "ACTIVE" });
      mockDb.booking.create.mockResolvedValue({
        id: "b-1",
        status: "REQUESTED",
        creditAmount: 2,
      });

      const res = await bookingsService.createBookingRequest("requester-1", {
        listingId: "listing-1",
        startsAt: new Date(Date.now() + 3600000).toISOString(),
        durationMinutes: 60,
      });

      expect(res.status).toBe("REQUESTED");
      expect(mockDb.booking.create).toHaveBeenCalled();
    });

    it("should reject booking if owner tries to book their own listing", async () => {
      mockDb.listing.findUnique.mockResolvedValue({
        id: "listing-1",
        ownerId: "user-1",
        groupId: "group-100",
        type: "OFFER",
        active: true,
      });

      await expect(
        bookingsService.createBookingRequest("user-1", {
          listingId: "listing-1",
          startsAt: new Date(Date.now() + 3600000).toISOString(),
          durationMinutes: 60,
        })
      ).rejects.toThrow("You cannot book your own listing");
    });
  });

  describe("acceptBooking & Overlap Prevention", () => {
    it("should allow provider to accept requested booking when no overlap exists", async () => {
      const startsAt = new Date("2026-12-01T10:00:00Z");
      mockDb.booking.findUnique.mockResolvedValue({
        id: "b-1",
        providerId: "provider-1",
        requesterId: "requester-1",
        status: "REQUESTED",
        startsAt,
        durationMinutes: 60,
      });

      // No overlapping bookings
      mockDb.booking.findMany.mockResolvedValue([]);
      mockDb.booking.update.mockResolvedValue({ id: "b-1", status: "ACCEPTED" });

      const updated = await bookingsService.acceptBooking("provider-1", "b-1");
      expect(updated.status).toBe("ACCEPTED");
      expect(mockDb.booking.update).toHaveBeenCalledWith({
        where: { id: "b-1" },
        data: { status: "ACCEPTED" },
      });
    });

    it("should reject acceptance if caller is NOT the provider", async () => {
      mockDb.booking.findUnique.mockResolvedValue({
        id: "b-1",
        providerId: "provider-1",
        status: "REQUESTED",
        startsAt: new Date(),
        durationMinutes: 60,
      });

      await expect(
        bookingsService.acceptBooking("intruder", "b-1")
      ).rejects.toThrow("Forbidden: Only the provider can accept a booking");
    });

    it("should block acceptance if provider has an overlapping accepted booking", async () => {
      const startsAt = new Date("2026-12-01T10:00:00Z");
      mockDb.booking.findUnique.mockResolvedValue({
        id: "b-2",
        providerId: "provider-1",
        status: "REQUESTED",
        startsAt,
        durationMinutes: 60, // 10:00 - 11:00
      });

      // Existing accepted booking overlapping: 10:30 - 11:30
      mockDb.booking.findMany.mockResolvedValue([
        {
          id: "b-existing",
          providerId: "provider-1",
          status: "ACCEPTED",
          startsAt: new Date("2026-12-01T10:30:00Z"),
          durationMinutes: 60,
        },
      ]);

      await expect(
        bookingsService.acceptBooking("provider-1", "b-2")
      ).rejects.toThrow("Provider has an overlapping accepted booking during this time slot");
    });
  });

  describe("declineBooking", () => {
    it("should allow provider to decline a requested booking", async () => {
      mockDb.booking.findUnique.mockResolvedValue({
        id: "b-1",
        providerId: "provider-1",
        status: "REQUESTED",
      });
      mockDb.booking.update.mockResolvedValue({ id: "b-1", status: "DECLINED" });

      const res = await bookingsService.declineBooking("provider-1", "b-1");
      expect(res.status).toBe("DECLINED");
    });

    it("should reject decline if not the provider", async () => {
      mockDb.booking.findUnique.mockResolvedValue({
        id: "b-1",
        providerId: "provider-1",
        status: "REQUESTED",
      });

      await expect(
        bookingsService.declineBooking("other-user", "b-1")
      ).rejects.toThrow("Forbidden: Only the provider can decline a booking");
    });
  });

  describe("cancelBooking", () => {
    it("should allow requester to cancel a REQUESTED booking", async () => {
      mockDb.booking.findUnique.mockResolvedValue({
        id: "b-1",
        requesterId: "requester-1",
        providerId: "provider-1",
        status: "REQUESTED",
      });
      mockDb.booking.update.mockResolvedValue({ id: "b-1", status: "CANCELLED" });

      const res = await bookingsService.cancelBooking("requester-1", "b-1");
      expect(res.status).toBe("CANCELLED");
    });

    it("should forbid provider from cancelling a REQUESTED booking", async () => {
      mockDb.booking.findUnique.mockResolvedValue({
        id: "b-1",
        requesterId: "requester-1",
        providerId: "provider-1",
        status: "REQUESTED",
      });

      await expect(
        bookingsService.cancelBooking("provider-1", "b-1")
      ).rejects.toThrow("Forbidden: Only the requester can cancel a requested booking");
    });

    it("should allow either party to cancel an ACCEPTED booking", async () => {
      mockDb.booking.findUnique.mockResolvedValue({
        id: "b-1",
        requesterId: "requester-1",
        providerId: "provider-1",
        status: "ACCEPTED",
      });
      mockDb.booking.update.mockResolvedValue({ id: "b-1", status: "CANCELLED" });

      const res1 = await bookingsService.cancelBooking("provider-1", "b-1");
      expect(res1.status).toBe("CANCELLED");

      const res2 = await bookingsService.cancelBooking("requester-1", "b-1");
      expect(res2.status).toBe("CANCELLED");
    });
  });
});
