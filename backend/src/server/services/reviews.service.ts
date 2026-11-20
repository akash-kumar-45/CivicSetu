import prisma from "../db";
import { CreateReviewInput, CreateReviewSchema } from "../validators/reviews.schema";

export class ReviewsService {
  private db: typeof prisma;

  constructor(customDb?: typeof prisma) {
    this.db = customDb || prisma;
  }

  async createReview(reviewerId: string, rawInput: CreateReviewInput) {
    const validated = CreateReviewSchema.parse(rawInput);

    const booking = await this.db.booking.findUnique({
      where: { id: validated.bookingId },
      include: {
        reviews: true,
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Validation: reviews are rejected for bookings that are not completed
    if (booking.status !== "COMPLETED" && booking.status !== "REVIEWED") {
      throw new Error("Cannot review a booking that is not completed");
    }

    // Caller must be one of the participants
    let revieweeId: string;
    if (booking.requesterId === reviewerId) {
      revieweeId = booking.providerId;
    } else if (booking.providerId === reviewerId) {
      revieweeId = booking.requesterId;
    } else {
      throw new Error("Forbidden: Only participants of this booking can submit a review");
    }

    // Check duplicate review
    const existing = await this.db.review.findUnique({
      where: {
        bookingId_reviewerId: {
          bookingId: validated.bookingId,
          reviewerId,
        },
      },
    });

    if (existing) {
      throw new Error("You have already submitted a review for this booking");
    }

    // Create the review
    const review = await this.db.review.create({
      data: {
        bookingId: validated.bookingId,
        reviewerId,
        revieweeId,
        rating: validated.rating,
        comment: validated.comment,
      },
      include: {
        reviewer: { select: { id: true, name: true } },
        reviewee: { select: { id: true, name: true } },
      },
    });

    // Update booking status to REVIEWED
    if (booking.status === "COMPLETED") {
      await this.db.booking.update({
        where: { id: validated.bookingId },
        data: { status: "REVIEWED" },
      });
    }

    return review;
  }

  async getUserRatingSummary(userId: string) {
    const reviews = await this.db.review.findMany({
      where: { revieweeId: userId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
      };
    }

    const sum = reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0);
    const average = Number((sum / reviews.length).toFixed(1));

    return {
      averageRating: average,
      totalReviews: reviews.length,
    };
  }

  async listBookingReviews(bookingId: string) {
    const reviews = await this.db.review.findMany({
      where: { bookingId },
      include: {
        reviewer: { select: { id: true, name: true } },
        reviewee: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return reviews;
  }
}

export const reviewsService = new ReviewsService();
