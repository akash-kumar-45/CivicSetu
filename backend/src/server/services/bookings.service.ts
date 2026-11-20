import prisma from "../db";
import { CreateBookingInput, CreateBookingSchema } from "../validators/bookings.schema";
import { LedgerService } from "./ledger.service";

export class BookingsService {
  private db: typeof prisma;
  private ledgerService: LedgerService;

  constructor(customDb?: typeof prisma, customLedger?: LedgerService) {
    this.db = customDb || prisma;
    this.ledgerService = customLedger || new LedgerService(this.db);
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

  async createBookingRequest(callerUserId: string, rawInput: CreateBookingInput) {
    const validated = CreateBookingSchema.parse(rawInput);
    const startsAt = new Date(validated.startsAt);

    const listing = await this.db.listing.findUnique({
      where: { id: validated.listingId },
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    if (!listing.active) {
      throw new Error("Cannot book an inactive listing");
    }

    // Determine requester and provider based on listing type
    let requesterId: string;
    let providerId: string;

    if (listing.type === "OFFER") {
      // Owner is offering service; caller requests it
      providerId = listing.ownerId;
      requesterId = callerUserId;
    } else {
      // Owner is requesting service; caller offers to fulfill it
      requesterId = listing.ownerId;
      providerId = callerUserId;
    }

    if (requesterId === providerId) {
      throw new Error("You cannot book your own listing");
    }

    // Verify both parties are ACTIVE members of the listing's group
    const isRequesterActive = await this.verifyActiveMembership(requesterId, listing.groupId);
    const isProviderActive = await this.verifyActiveMembership(providerId, listing.groupId);

    if (!isRequesterActive) {
      throw new Error("Requester is not an active member of this cooperative group");
    }

    if (!isProviderActive) {
      throw new Error("Provider is not an active member of this cooperative group");
    }

    // Calculate integer time credit amount (1 hour = hourlyCredits)
    // Duration in minutes converted to credit units
    const creditAmount = Math.max(
      1,
      Math.round((validated.durationMinutes / 60) * listing.hourlyCredits)
    );

    const booking = await this.db.booking.create({
      data: {
        listingId: listing.id,
        requesterId,
        providerId,
        startsAt,
        durationMinutes: validated.durationMinutes,
        creditAmount,
        status: "REQUESTED",
      },
      include: {
        listing: { select: { id: true, title: true, category: true, groupId: true } },
        requester: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
      },
    });

    return booking;
  }

  async acceptBooking(callerUserId: string, bookingId: string) {
    const booking = await this.db.booking.findUnique({
      where: { id: bookingId },
      include: { listing: true },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Only provider can accept
    if (booking.providerId !== callerUserId) {
      throw new Error("Forbidden: Only the provider can accept a booking");
    }

    // State machine: only transition from REQUESTED
    if (booking.status !== "REQUESTED") {
      throw new Error(`Invalid state transition: Cannot accept a booking with status ${booking.status}`);
    }

    // Enforce Overlap Rule:
    // A provider cannot have two overlapping accepted bookings.
    const newStart = booking.startsAt.getTime();
    const newEnd = newStart + booking.durationMinutes * 60 * 1000;

    const activeBookings = await this.db.booking.findMany({
      where: {
        providerId: booking.providerId,
        status: "ACCEPTED",
        id: { not: booking.id },
      },
    });

    for (const b of activeBookings) {
      const existingStart = b.startsAt.getTime();
      const existingEnd = existingStart + b.durationMinutes * 60 * 1000;

      // Overlap condition: start1 < end2 && start2 < end1
      if (newStart < existingEnd && existingStart < newEnd) {
        throw new Error("Provider has an overlapping accepted booking during this time slot");
      }
    }

    const updated = await this.db.booking.update({
      where: { id: bookingId },
      data: { status: "ACCEPTED" },
    });

    return updated;
  }

  async declineBooking(callerUserId: string, bookingId: string) {
    const booking = await this.db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Only provider can decline
    if (booking.providerId !== callerUserId) {
      throw new Error("Forbidden: Only the provider can decline a booking");
    }

    // State machine: only transition from REQUESTED
    if (booking.status !== "REQUESTED") {
      throw new Error(`Invalid state transition: Cannot decline a booking with status ${booking.status}`);
    }

    const updated = await this.db.booking.update({
      where: { id: bookingId },
      data: { status: "DECLINED" },
    });

    return updated;
  }

  async cancelBooking(callerUserId: string, bookingId: string) {
    const booking = await this.db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Rules:
    // - Only the requester can cancel a requested booking.
    // - Either party can cancel an accepted one.
    if (booking.status === "REQUESTED") {
      if (booking.requesterId !== callerUserId) {
        throw new Error("Forbidden: Only the requester can cancel a requested booking");
      }
    } else if (booking.status === "ACCEPTED") {
      if (booking.requesterId !== callerUserId && booking.providerId !== callerUserId) {
        throw new Error("Forbidden: Only booking participants can cancel an accepted booking");
      }
    } else {
      throw new Error(`Invalid state transition: Cannot cancel a booking with status ${booking.status}`);
    }

    const updated = await this.db.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    return updated;
  }

  async completeBooking(callerUserId: string, bookingId: string) {
    const booking = await this.db.booking.findUnique({
      where: { id: bookingId },
      include: { listing: true },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Only the provider marks a booking completed
    if (booking.providerId !== callerUserId) {
      throw new Error("Forbidden: Only the provider can mark a booking as completed");
    }

    // Reject any transition from status other than ACCEPTED
    if (booking.status !== "ACCEPTED") {
      throw new Error(`Invalid state transition: Cannot complete a booking with status ${booking.status}`);
    }

    // Only after startsAt has passed
    if (new Date() < booking.startsAt) {
      throw new Error("Cannot complete booking: start time has not passed yet");
    }

    // Check requester has enough balance. A balance cannot go negative.
    const requesterBalance = await this.ledgerService.getUserBalance(booking.requesterId, booking.listing.groupId);
    if (requesterBalance < booking.creditAmount) {
      throw new Error(
        `Insufficient credit balance: Requester has ${requesterBalance} credits, but ${booking.creditAmount} credits are required.`
      );
    }

    // Atomic execution in a single database transaction:
    // Writes LedgerEntry (requester pays provider) inside the same database transaction as the status change.
    // If either fails, both roll back.
    const result = await this.db.$transaction(async (tx: any) => {
      // Re-verify status inside transaction to prevent double completion
      const current = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      if (current.status !== "ACCEPTED") {
        throw new Error("Booking is no longer in ACCEPTED status");
      }

      // Update status to COMPLETED
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: "COMPLETED" },
      });

      // Post append-only LedgerEntry
      const ledgerEntry = await tx.ledgerEntry.create({
        data: {
          groupId: booking.listing.groupId,
          fromUserId: booking.requesterId,
          toUserId: booking.providerId,
          amount: booking.creditAmount,
          bookingId: booking.id,
        },
      });

      return { booking: updatedBooking, ledgerEntry };
    });

    return result;
  }

  async getBookingById(callerUserId: string, bookingId: string) {
    const booking = await this.db.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: { select: { id: true, title: true, category: true, groupId: true } },
        requester: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
        ledgerEntry: true,
        reviews: true,
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.requesterId !== callerUserId && booking.providerId !== callerUserId) {
      throw new Error("Forbidden: You do not have permission to view this booking");
    }

    return booking;
  }

  async listUserBookings(callerUserId: string, role?: "requester" | "provider") {
    const bookings = await this.db.booking.findMany({
      where: {
        ...(role === "requester"
          ? { requesterId: callerUserId }
          : role === "provider"
          ? { providerId: callerUserId }
          : { OR: [{ requesterId: callerUserId }, { providerId: callerUserId }] }),
      },
      include: {
        listing: { select: { id: true, title: true, category: true, groupId: true } },
        requester: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
        ledgerEntry: true,
        reviews: true,
      },
      orderBy: { startsAt: "desc" },
    });

    return bookings;
  }
}

export const bookingsService = new BookingsService();
