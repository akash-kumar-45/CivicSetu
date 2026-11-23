import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "../../../../../backend/src/server/db";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/^\+91[\s-]?/, "").replace(/\s+/g, ""))
    .refine((val) => /^[6-9]\d{9}$/.test(val), {
      message: "Enter a valid 10-digit active Indian mobile number",
    }),
  ward: z.string().trim().min(2, "Primary ward/locality is required"),
  userIntent: z.enum(["OWNER", "WORKER", "BOTH"]),
  skills: z.array(z.string().trim()).optional().default([]),
  bio: z.string().trim().max(300, "Bio must be under 300 characters").optional().nullable(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        userIntent: true,
        ward: true,
        idType: true,
        govIdNumber: true,
        isVerified: true,
        skills: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ profile: user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const cleanSkills =
      parsed.data.userIntent === "OWNER"
        ? []
        : parsed.data.skills.filter((s) => s.length > 0);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        ward: parsed.data.ward,
        userIntent: parsed.data.userIntent,
        skills: cleanSkills,
        bio: parsed.data.bio || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        userIntent: true,
        ward: true,
        idType: true,
        govIdNumber: true,
        isVerified: true,
        skills: true,
        bio: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      profile: updated,
      message: "Civic profile updated successfully!",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}