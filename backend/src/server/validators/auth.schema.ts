import { z } from "zod";

export const RegisterInputSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please provide a valid email address").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["MEMBER", "ADMIN"]).optional().default("MEMBER"),

  // Civic e-KYC & Hyperlocal Profile Fields
  userIntent: z.enum(["OWNER", "WORKER", "BOTH"]).optional().default("BOTH"),
  ward: z.string().trim().min(2, "Ward / Locality is required"),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/^\+91[\s-]?/, "").replace(/\s+/g, ""))
    .refine((val) => /^[6-9]\d{9}$/.test(val), {
      message: "Enter a valid 10-digit active Indian mobile number",
    }),
  idType: z.enum(["AADHAAR", "VOTER_ID", "DIGILOCKER"]).optional(),
  govIdNumber: z.string().trim().min(4, "Please provide a valid ID reference").optional(),
  isVerified: z.boolean().optional().default(true),
  skills: z.array(z.string().trim()).optional().default([]),
  bio: z.string().trim().max(300).optional(),
});

export type RegisterInput = z.input<typeof RegisterInputSchema>;

export const LoginInputSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.input<typeof LoginInputSchema>;