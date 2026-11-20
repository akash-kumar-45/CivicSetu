import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReviewsService } from "../server/services/reviews.service";

describe("ReviewsService", () => {
  let mockDb: any;
  let reviewsService: ReviewsService;

  beforeEach(() => {
    mockDb = {
      booking: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      review: {
        findUnique: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
      },
    };

    reviewsService = new ReviewsService(mockDb);
  });

  describe("createReview", () => {
    it("should allow a participant to review a COMPLETED booking", async () => {
      mockDb.booking.findUnique.mockResolvedValue({
        id: "b-100",
        requesterId: "requester-1",
        providerId: "provider-1",
        status: "COMPLETED",
        reviews: [],
      });

      mockDb.review.findUnique.mockResolvedValue(null); // No prior review
      mockDb.review.create.mockResolvedValue({
        id: "rev-1",
        bookingId: "b-100",
        reviewerId: "requester-1",
        revieweeId: "provider-1",
        rating: 5,
        comment: "Excellent service!",
      });

      const res = await reviewsService.createReview("requester-1", {
        bookingId: "b-100",
        rating: 5,
        comment: "Excellent service!",
      });

      expect(res.rating).toBe(5);
      expect(mockDb.review.create).toHaveBeenCalled();
      expect(mockDb.booking.update).toHaveBeenCalledWith({
        where: { id: "b-100" },
        data: { status: "REVIEWED" },
      });
    });

    it("should reject reviews for bookings that are NOT completed", async () => {
      mockDb.booking.findUnique.mockResolvedValue({
        id: "b-100",
        requesterId: "requester-1",
        providerId: "provider-1",
        status: "ACCEPTED", // Not completed yet
        reviews: [],
      });

      await expect(
        reviewsService.createReview("requester-1", {
          bookingId: "b-100",
          rating: 4,
        })
      ).rejects.toThrow("Cannot review a booking that is not completed");

      expect(mockDb.review.create).not.toHaveBeenCalled();
    });

    it("should reject duplicate reviews from the same party on the same booking", async () => {
      mockDb.booking.findUnique.mockResolvedValue({
        id: "b-100",
        requesterId: "requester-1",
        providerId: "provider-1",
        status: "COMPLETED",
      });

      // Existing review found
      mockDb.review.findUnique.mockResolvedValue({
        id: "rev-existing",
        bookingId: "b-100",
        reviewerId: "requester-1",
      });

      await expect(
        reviewsService.createReview("requester-1", {
          bookingId: "b-100",
          rating: 5,
        })
      ).rejects.toThrow("You have already submitted a review for this booking");

      expect(mockDb.review.create).not.toHaveBeenCalled();
    });

    it("should reject review submission from a non-participant", async () => {
      mockDb.booking.findUnique.mockResolvedValue({
        id: "b-100",
        requesterId: "requester-1",
        providerId: "provider-1",
        status: "COMPLETED",
      });

      await expect(
        reviewsService.createReview("random-user", {
          bookingId: "b-100",
          rating: 5,
        })
      ).rejects.toThrow("Forbidden: Only participants of this booking can submit a review");
    });
  });

  describe("getUserRatingSummary", () => {
    it("should calculate average rating accurately", async () => {
      mockDb.review.findMany.mockResolvedValue([
        { rating: 5 },
        { rating: 4 },
        { rating: 5 },
      ]);

      const summary = await reviewsService.getUserRatingSummary("user-1");
      expect(summary.totalReviews).toBe(3);
      expect(summary.averageRating).toBe(4.7);
    });

    it("should return zero when user has no reviews", async () => {
      mockDb.review.findMany.mockResolvedValue([]);

      const summary = await reviewsService.getUserRatingSummary("new-user");
      expect(summary.totalReviews).toBe(0);
      expect(summary.averageRating).toBe(0);
    });
  });
});
