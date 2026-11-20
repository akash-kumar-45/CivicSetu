import { z } from "zod";

export const CreateBookingSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required"),
  startsAt: z.string().datetime({ message: "startsAt must be a valid ISO datetime string" }),
  durationMinutes: z
    .number()
    .int("Duration must be an integer number of minutes")
    .min(15, "Duration must be at least 15 minutes")
    .max(1440, "Duration cannot exceed 24 hours"),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

export const BookingActionSchema = z.object({
  action: z.enum(["ACCEPT", "DECLINE", "CANCEL", "COMPLETE"]),
});

export type BookingActionInput = z.infer<typeof BookingActionSchema>;
