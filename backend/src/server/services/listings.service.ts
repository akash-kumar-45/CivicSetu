import prisma from "../db";
import {
  CreateListingInput,
  CreateListingSchema,
  UpdateListingInput,
  UpdateListingSchema,
} from "../validators/listings.schema";

export class ListingsService {
  private db: typeof prisma;

  constructor(customDb?: typeof prisma) {
    this.db = customDb || prisma;
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

  async createListing(userId: string, rawInput: CreateListingInput) {
    const validated = CreateListingSchema.parse(rawInput);

    const isActiveMember = await this.verifyActiveMembership(userId, validated.groupId);
    if (!isActiveMember) {
      throw new Error("Forbidden: You must be an active member of this group to create a listing");
    }

    const listing = await this.db.listing.create({
      data: {
        ownerId: userId,
        groupId: validated.groupId,
        type: validated.type,
        category: validated.category,
        title: validated.title,
        description: validated.description,
        hourlyCredits: validated.hourlyCredits,
        active: true,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return listing;
  }

  async updateListing(userId: string, listingId: string, rawInput: UpdateListingInput) {
    const validated = UpdateListingSchema.parse(rawInput);

    const listing = await this.db.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    if (listing.ownerId !== userId) {
      throw new Error("Forbidden: Only the owner can edit a listing");
    }

    const updated = await this.db.listing.update({
      where: { id: listingId },
      data: {
        ...(validated.title !== undefined && { title: validated.title }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.category !== undefined && { category: validated.category }),
        ...(validated.hourlyCredits !== undefined && { hourlyCredits: validated.hourlyCredits }),
        ...(validated.active !== undefined && { active: validated.active }),
      },
    });

    return updated;
  }

  async deactivateListing(userId: string, listingId: string) {
    const listing = await this.db.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    if (listing.ownerId !== userId) {
      throw new Error("Forbidden: Only the owner can deactivate a listing");
    }

    const updated = await this.db.listing.update({
      where: { id: listingId },
      data: { active: false },
    });

    return updated;
  }

  async listGroupListings(
    userId: string,
    groupId: string,
    filters?: { type?: "OFFER" | "REQUEST"; category?: string; activeOnly?: boolean }
  ) {
    const isActiveMember = await this.verifyActiveMembership(userId, groupId);
    if (!isActiveMember) {
      throw new Error("Forbidden: You must be an active member of this group to view listings");
    }

    const activeFilter = filters?.activeOnly === false ? undefined : true;

    const listings = await this.db.listing.findMany({
      where: {
        groupId,
        ...(activeFilter !== undefined && { active: activeFilter }),
        ...(filters?.type && { type: filters.type }),
        ...(filters?.category && {
          category: {
            equals: filters.category,
            mode: "insensitive",
          },
        }),
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return listings;
  }

  async getListingById(userId: string, listingId: string) {
    const listing = await this.db.listing.findUnique({
      where: { id: listingId },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        group: {
          select: { id: true, name: true, locality: true },
        },
      },
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    const isActiveMember = await this.verifyActiveMembership(userId, listing.groupId);
    if (!isActiveMember) {
      throw new Error("Forbidden: You must be an active member of this group to view this listing");
    }

    return listing;
  }
}

export const listingsService = new ListingsService();
