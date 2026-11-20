import { z } from "zod";

export const CreateGroupSchema = z.object({
  name: z.string().trim().min(3, "Group name must be at least 3 characters").max(100),
  locality: z.string().trim().min(2, "Locality must be at least 2 characters").max(100),
});

export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;

export const UpdateMembershipStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export type UpdateMembershipStatusInput = z.infer<typeof UpdateMembershipStatusSchema>;
