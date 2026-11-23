import prisma from "../db";
import { z } from "zod";
import { friendsService } from "./friends.service";

export const CreateListingSchema = z.object({
  groupId: z.string().uuid().optional().nullable(),
  type: z.enum(["OFFER", "REQUEST"]).optional().default("REQUEST"),
  category: z.string().trim().min(2, "Category is required"),
  title: z.string().trim().min(4, "Job title must be at least 4 characters"),
  description: z.string().trim().min(10, "Please describe the work clearly"),
  hourlyCredits: z.coerce.number().int().min(50, "Minimum direct payout is ₹50"),
  roughLocation: z.string().trim().min(2, "Rough ward/locality is required"),
  exactAddress: z.string().trim().min(5, "Exact street/house address is required"),
  visibility: z.enum(["PUBLIC", "WARD_ONLY", "DIRECT"]).optional().default("PUBLIC"),
  targetWorkerId: z.string().uuid().optional().nullable(),
});

export type CreateListingInput = z.input<typeof CreateListingSchema>;

export class ListingsService {
  private db: typeof prisma;

  constructor(customDb?: typeof prisma) {
    this.db = customDb || prisma;
  }

  /**
   * Sanitizes a listing record so `exactAddress` is ONLY visible to:
   * 1. The job owner (`ownerId`)
   * 2. A worker whose booking is ACCEPTED, COMPLETED, or REVIEWED
   */
  private applyLocationPrivacy(listing: any, viewerId?: string) {
    const isOwner = Boolean(viewerId && listing.ownerId === viewerId);
    const isAcceptedWorker = Boolean(
      viewerId &&
        Array.isArray(listing.bookings) &&
        listing.bookings.some(
          (b: any) =>
            (b.providerId === viewerId || b.requesterId === viewerId) &&
            ["ACCEPTED", "COMPLETED", "REVIEWED"].includes(b.status)
        )
    );

    const canSeeExactAddress = isOwner || isAcceptedWorker;
    const myBooking =
      viewerId && Array.isArray(listing.bookings)
        ? listing.bookings.find(
            (b: any) =>
              (b.providerId === viewerId || b.requesterId === viewerId) &&
              ["REQUESTED", "ACCEPTED", "COMPLETED", "REVIEWED"].includes(b.status)
          )
        : null;

    const { bookings, ...cleanListing } = listing;

    return {
      ...cleanListing,
      exactAddress: canSeeExactAddress ? listing.exactAddress : null,
      isAddressUnlocked: canSeeExactAddress,
      userBookingStatus: myBooking ? myBooking.status : null,
    };
  }

  async createListing(ownerId: string, rawInput: CreateListingInput) {
    const validated = CreateListingSchema.parse(rawInput);

    // If WARD_ONLY, require and validate active membership in that ward/group
    if (validated.visibility === "WARD_ONLY") {
      if (!validated.groupId) {
        throw new Error("Please select a Ward / Society for Ward-Only listings");
      }

      const membership = await this.db.membership.findUnique({
        where: {
          userId_groupId: { userId: ownerId, groupId: validated.groupId },
        },
      });

      if (!membership || membership.status !== "ACTIVE") {
        throw new Error("You must be an active member of this ward to post a Ward-Only job");
      }
    }

    // Validate Direct Friend Offer rules
    if (validated.visibility === "DIRECT") {
      if (!validated.targetWorkerId) {
        throw new Error("Please select a trusted worker for a direct job offer");
      }

      const isTrusted = await friendsService.isTrustedWorker(
        ownerId,
        validated.targetWorkerId  
      );
      if (!isTrusted) {
        throw new Error(
          "You can only send direct offers to friends who accepted your Trusted Circle request"
        );
      }

      const targetUser = await this.db.user.findUnique({
        where: { id: validated.targetWorkerId },
        select: { userIntent: true, name: true },
      });

      if (!targetUser || targetUser.userIntent === "OWNER") {
        throw new Error(
          `${targetUser?.name || "This user"} is registered only as a Citizen (not a Worker) and cannot receive direct job offers`
        );
      }
    }

    const listing = await this.db.listing.create({
      data: {
        owner: { connect: { id: ownerId } },
        ...(validated.groupId ? { group: { connect: { id: validated.groupId } } } : {}),
        ...(validated.visibility === "DIRECT" && validated.targetWorkerId
          ? { targetWorker: { connect: { id: validated.targetWorkerId } } }
          : {}),
        type: validated.type,
        category: validated.category,
        title: validated.title,
        description: validated.description,
        hourlyCredits: validated.hourlyCredits,
        roughLocation: validated.roughLocation,
        exactAddress: validated.exactAddress,
        visibility: validated.visibility,
        active: true,
      },
      include: {
        owner: {
          select: { id: true, name: true, ward: true, isVerified: true },
        },
        targetWorker: {
          select: { id: true, name: true, ward: true, isVerified: true },
        },
        group: {
          select: { id: true, name: true, locality: true },
        },
      },
    });

    return this.applyLocationPrivacy(listing, ownerId);
  }

  async getListings(
    viewerId?: string,
    filters?: { groupId?: string; category?: string; search?: string }
  ) {
    const userMemberships = viewerId
      ? await this.db.membership.findMany({
          where: { userId: viewerId, status: "ACTIVE" },
          select: { groupId: true },
        })
      : [];
    const myGroupIds = userMemberships.map((m: any) => m.groupId);

    const whereClause: any = {
      active: true,
      // Visibility Guard:
      // 1. PUBLIC (City-Wide / All Users)
      // 2. WARD_ONLY (Only active members of that ward)
      // 3. Owner's own jobs
      // 4. DIRECT offers sent specifically to viewerId
      OR: viewerId
        ? [
            { visibility: "PUBLIC" },
            { visibility: "WARD_ONLY", groupId: { in: myGroupIds } },
            { ownerId: viewerId },
            { visibility: "DIRECT", targetWorkerId: viewerId },
          ]
        : [{ visibility: "PUBLIC" }],
    };

    if (filters?.groupId) {
      whereClause.groupId = filters.groupId;
    }
    if (filters?.category && filters.category !== "ALL") {
      whereClause.category = filters.category;
    }
    if (filters?.search) {
      whereClause.AND = [
        {
          OR: [
            { title: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
            { roughLocation: { contains: filters.search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const listings = await this.db.listing.findMany({
      where: whereClause,
      include: {
        owner: {
          select: { id: true, name: true, ward: true, isVerified: true },
        },
        targetWorker: {
          select: { id: true, name: true, ward: true, isVerified: true },
        },
        group: {
          select: { id: true, name: true, locality: true },
        },
        bookings: viewerId
          ? {
              where: {
                OR: [{ providerId: viewerId }, { requesterId: viewerId }],
              },
              select: { providerId: true, requesterId: true, status: true },
            }
          : false,
      },
      orderBy: [{ visibility: "desc" }, { createdAt: "desc" }],
    });

    return listings.map((item: any) => this.applyLocationPrivacy(item, viewerId));
  }

  async getListingById(listingId: string, viewerId?: string) {
    const listing = await this.db.listing.findUnique({
      where: { id: listingId },
      include: {
        owner: {
          select: { id: true, name: true, ward: true, isVerified: true },
        },
        targetWorker: {
          select: { id: true, name: true, ward: true, isVerified: true },
        },
        group: {
          select: { id: true, name: true, locality: true },
        },
        bookings: viewerId
          ? {
              where: {
                OR: [{ providerId: viewerId }, { requesterId: viewerId }],
              },
              select: { providerId: true, requesterId: true, status: true },
            }
          : false,
      },
    });

    if (!listing) {
      throw new Error("Job listing not found");
    }

    if (
      listing.visibility === "DIRECT" &&
      listing.ownerId !== viewerId &&
      listing.targetWorkerId !== viewerId
    ) {
      throw new Error("Unauthorized: This is a private direct job offer");
    }

    if (listing.visibility === "WARD_ONLY" && listing.ownerId !== viewerId) {
      const membership =
        viewerId && listing.groupId
          ? await this.db.membership.findUnique({
              where: {
                userId_groupId: { userId: viewerId, groupId: listing.groupId },
              },
            })
          : null;

      if (!membership || membership.status !== "ACTIVE") {
        throw new Error("Unauthorized: This job is restricted to verified ward members");
      }
    }

    return this.applyLocationPrivacy(listing, viewerId);
  }
  async updateListing(ownerId: string, listingId: string, rawInput: any) {
    const existing = await this.db.listing.findUnique({
      where: { id: listingId },
    });
    if (!existing) {
      throw new Error("Listing not found");
    }
    if (existing.ownerId !== ownerId) {
      throw new Error("Unauthorized: Only the job owner can update this listing");
    }

    const updated = await this.db.listing.update({
      where: { id: listingId },
      data: {
        ...(rawInput.title !== undefined && { title: rawInput.title }),
        ...(rawInput.description !== undefined && { description: rawInput.description }),
        ...(rawInput.category !== undefined && { category: rawInput.category }),
        ...(rawInput.hourlyCredits !== undefined && { hourlyCredits: rawInput.hourlyCredits }),
        ...(rawInput.roughLocation !== undefined && { roughLocation: rawInput.roughLocation }),
        ...(rawInput.exactAddress !== undefined && { exactAddress: rawInput.exactAddress }),
        ...(rawInput.active !== undefined && { active: rawInput.active }),
      },
      include: {
        owner: { select: { id: true, name: true, ward: true, isVerified: true } },
        group: { select: { id: true, name: true, locality: true } },
      },
    });

    return this.applyLocationPrivacy(updated, ownerId);
  }

  async deactivateListing(ownerId: string, listingId: string) {
    const existing = await this.db.listing.findUnique({
      where: { id: listingId },
    });
    if (!existing) {
      throw new Error("Listing not found");
    }
    if (existing.ownerId !== ownerId) {
      throw new Error("Unauthorized: Only the job owner can remove this listing");
    }

    return this.db.listing.update({
      where: { id: listingId },
      data: { active: false },
    });
  }
}

export const listingsService = new ListingsService();