import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { bookingsService } from "@coop/backend/server/services/bookings.service";
import { CreateBookingSchema } from "@coop/backend/server/validators/bookings.schema";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") as "requester" | "provider" | null;

    const bookings = await bookingsService.listUserBookings(userId, role || undefined);
    return NextResponse.json({ bookings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve bookings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = CreateBookingSchema.parse(body);

    const booking = await bookingsService.createBookingRequest(userId, validatedData);
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const isForbidden = error?.message?.includes("Forbidden");
    return NextResponse.json(
      { error: error?.message || "Failed to create booking request" },
      { status: isForbidden ? 403 : 400 }
    );
  }
}
