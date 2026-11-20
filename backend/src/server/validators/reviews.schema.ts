import { z } from "zod";

export const CreateReviewSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  comment: z.string().trim().max(500, "Comment cannot exceed 500 characters").optional(),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
