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

    // Prevent duplicate applications by the same worker on the same job
    const existingBooking = await this.db.booking.findFirst({
      where: {
        listingId: listing.id,
        requesterId,
        providerId,
        status: { in: ["REQUESTED", "ACCEPTED"] },
      },
    });

    if (existingBooking) {
      throw new Error(
        existingBooking.status === "ACCEPTED"
          ? "You have already been hired for this job"
          : "You have already applied for this job and are awaiting owner approval"
      );
    }

    // Enforce Direct Offer privacy

// Enforce Direct Offer privacy
    if (listing.visibility === "DIRECT" && listing.targetWorkerId !== callerUserId) {
      throw new Error("Forbidden: This is a private direct job offer for another worker");
    }

    // Only enforce ward membership when the job is restricted to WARD_ONLY
    if (listing.visibility === "WARD_ONLY" && listing.groupId) {
      const isRequesterActive = await this.verifyActiveMembership(requesterId, listing.groupId);
      const isProviderActive = await this.verifyActiveMembership(providerId, listing.groupId);

      if (!isRequesterActive) {
        throw new Error("Job owner is not an active member of this ward");
      }

      if (!isProviderActive) {
        throw new Error("You must be an active member of this ward to apply for this job");
      }
    }

    // Direct Rupee payout amount (₹0 commission)
    const creditAmount = listing.hourlyCredits;

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

// Only the job owner (listing.ownerId) can accept an application/booking
    if (booking.listing.ownerId !== callerUserId) {
      throw new Error("Forbidden: Only the job owner can accept an applicant");
    }

    // State machine: only transition from REQUESTED
    if (booking.status !== "REQUESTED") {
      throw new Error(`Invalid state transition: Cannot accept a booking with status ${booking.status}`);
    }
// Hire the selected worker, close the listing from further public applications,
    // and decline any competing pending applicants for this same job.
    const updated = await this.db.$transaction(async (tx: any) => {
      const accepted = await tx.booking.update({
        where: { id: bookingId },
        data: { status: "ACCEPTED" },
      });

      await tx.booking.updateMany({
        where: {
          listingId: booking.listingId,
          id: { not: bookingId },
          status: "REQUESTED",
        },
        data: { status: "DECLINED" },
      });

      await tx.listing.update({
        where: { id: booking.listingId },
        data: { active: false },
      });

      return accepted;
    });

    return updated;
  }

    async declineBooking(callerUserId: string, bookingId: string) {
    const booking = await this.db.booking.findUnique({
      where: { id: bookingId },
      include: { listing: true },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Only the job owner (listing.ownerId) can decline an applicant
    if (booking.listing.ownerId !== callerUserId) {
      throw new Error("Forbidden: Only the job owner can decline an applicant");
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
      if (booking.requesterId !== callerUserId && booking.providerId !== callerUserId) {
        throw new Error("Forbidden: Only booking participants can withdraw this request");
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

// Atomic execution in a single database transaction:
    // Records direct settlement audit entry alongside COMPLETED status.
    const result = await this.db.$transaction(async (tx: any) => {
      const current = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      if (current.status !== "ACCEPTED") {
        throw new Error("Booking is no longer in ACCEPTED status");
      }

      // Update status to COMPLETED with dual-confirmation flags
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "COMPLETED",
          ownerCompleted: true,
          workerCompleted: true,
        },
      });

      // Post append-only direct settlement audit record
      const ledgerEntry = await tx.ledgerEntry.create({
        data: {
          groupId: booking.listing.groupId || null,
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
        listing: {
          select: {
            id: true,
            ownerId: true,
            title: true,
            category: true,
            groupId: true,
            roughLocation: true,
            exactAddress: true,
          },
        },
        requester: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
        ledgerEntry: true,
        reviews: true,
      },
      orderBy: { startsAt: "desc" },
    });

    // Enforce Two-Stage Location Privacy: strip exactAddress until ACCEPTED/COMPLETED/REVIEWED
    return bookings.map((b: any) => {
      const unlocked =
        b.requesterId === callerUserId ||
        ["ACCEPTED", "COMPLETED", "REVIEWED"].includes(b.status);

      return {
        ...b,
        listing: b.listing
          ? {
              ...b.listing,
              exactAddress: unlocked ? b.listing.exactAddress : null,
            }
          : null,
      };
    });
  }
}

export const bookingsService = new BookingsService();
