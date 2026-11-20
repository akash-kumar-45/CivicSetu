import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListingsService } from "../server/services/listings.service";

describe("ListingsService", () => {
  let mockDb: any;
  let listingsService: ListingsService;

  beforeEach(() => {
    mockDb = {
      membership: {
        findUnique: vi.fn(),
      },
      listing: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
      },
    };
    listingsService = new ListingsService(mockDb);
  });

  describe("createListing", () => {
    it("should allow an ACTIVE member to create a listing", async () => {
      mockDb.membership.findUnique.mockResolvedValue({ status: "ACTIVE" });
      mockDb.listing.create.mockResolvedValue({
        id: "listing-1",
        ownerId: "user-1",
        groupId: "group-100",
        type: "OFFER",
        category: "Cleaning",
        title: "Apartment Deep Clean",
        description: "Experienced deep cleaner with own eco-friendly supplies.",
        hourlyCredits: 2,
        active: true,
      });

      const listing = await listingsService.createListing("user-1", {
        groupId: "group-100",
        type: "OFFER",
        category: "Cleaning",
        title: "Apartment Deep Clean",
        description: "Experienced deep cleaner with own eco-friendly supplies.",
        hourlyCredits: 2,
      });

      expect(listing).toBeDefined();
      expect(listing.title).toBe("Apartment Deep Clean");
      expect(mockDb.listing.create).toHaveBeenCalled();
    });

    it("should reject listing creation if user is NOT an active member of the group", async () => {
      mockDb.membership.findUnique.mockResolvedValue(null);

      await expect(
        listingsService.createListing("user-1", {
          groupId: "group-100",
          type: "OFFER",
          category: "Cleaning",
          title: "Apartment Deep Clean",
          description: "Experienced deep cleaner with own eco-friendly supplies.",
          hourlyCredits: 2,
        })
      ).rejects.toThrow("Forbidden: You must be an active member of this group to create a listing");
    });
  });

  describe("updateListing & deactivateListing", () => {
    it("should allow the listing owner to update their listing", async () => {
      mockDb.listing.findUnique.mockResolvedValue({
        id: "listing-1",
        ownerId: "user-1",
        groupId: "group-100",
        title: "Old Title",
      });

      mockDb.listing.update.mockResolvedValue({
        id: "listing-1",
        ownerId: "user-1",
        title: "Updated Title Here",
      });

      const updated = await listingsService.updateListing("user-1", "listing-1", {
        title: "Updated Title Here",
      });

      expect(updated.title).toBe("Updated Title Here");
      expect(mockDb.listing.update).toHaveBeenCalled();
    });

    it("should reject edit if caller is NOT the owner", async () => {
      mockDb.listing.findUnique.mockResolvedValue({
        id: "listing-1",
        ownerId: "user-1",
        groupId: "group-100",
      });

      await expect(
        listingsService.updateListing("user-intruder", "listing-1", {
          title: "Hacked Title",
        })
      ).rejects.toThrow("Forbidden: Only the owner can edit a listing");
    });

    it("should allow owner to deactivate and reject non-owner deactivation", async () => {
      mockDb.listing.findUnique.mockResolvedValue({
        id: "listing-1",
        ownerId: "user-1",
        groupId: "group-100",
      });
      mockDb.listing.update.mockResolvedValue({ id: "listing-1", active: false });

      const deactivated = await listingsService.deactivateListing("user-1", "listing-1");
      expect(deactivated.active).toBe(false);

      await expect(
        listingsService.deactivateListing("user-other", "listing-1")
      ).rejects.toThrow("Forbidden: Only the owner can deactivate a listing");
    });
  });

  describe("listGroupListings", () => {
    it("should allow ACTIVE members to browse listings for their group", async () => {
      mockDb.membership.findUnique.mockResolvedValue({ status: "ACTIVE" });
      mockDb.listing.findMany.mockResolvedValue([
        { id: "listing-1", title: "Math Tutoring", active: true },
      ]);

      const results = await listingsService.listGroupListings("user-1", "group-100", {
        category: "Tutoring",
      });

      expect(results.length).toBe(1);
      expect(results[0].title).toBe("Math Tutoring");
    });

    it("should reject non-members from viewing group listings", async () => {
      mockDb.membership.findUnique.mockResolvedValue({ status: "PENDING" });

      await expect(
        listingsService.listGroupListings("user-non-active", "group-100")
      ).rejects.toThrow("Forbidden: You must be an active member of this group to view listings");
    });
  });
});
