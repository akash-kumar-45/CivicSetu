import { z } from "zod";

export const CreateListingSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  type: z.enum(["OFFER", "REQUEST"]),
  category: z.string().trim().min(2, "Category is required").max(50),
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(1000),
  hourlyCredits: z
    .number()
    .int("Hourly credits must be an integer")
    .positive("Hourly credits must be at least 1"),
});

export type CreateListingInput = z.infer<typeof CreateListingSchema>;

export const UpdateListingSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().min(10).max(1000).optional(),
  category: z.string().trim().min(2).max(50).optional(),
  hourlyCredits: z.number().int().positive().optional(),
  active: z.boolean().optional(),
});

export type UpdateListingInput = z.infer<typeof UpdateListingSchema>;
