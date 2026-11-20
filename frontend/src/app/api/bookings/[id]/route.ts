import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { bookingsService } from "@coop/backend/server/services/bookings.service";
import { BookingActionSchema } from "@coop/backend/server/validators/bookings.schema";
import { ZodError } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booking = await bookingsService.getBookingById(userId, params.id);
    return NextResponse.json({ booking });
  } catch (error: any) {
    const isForbidden = error?.message?.includes("Forbidden");
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve booking" },
      { status: isForbidden ? 403 : 404 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = BookingActionSchema.parse(body);

    let result;
    if (action === "ACCEPT") {
      result = await bookingsService.acceptBooking(userId, params.id);
    } else if (action === "DECLINE") {
      result = await bookingsService.declineBooking(userId, params.id);
    } else if (action === "CANCEL") {
      result = await bookingsService.cancelBooking(userId, params.id);
    } else if (action === "COMPLETE") {
      result = await bookingsService.completeBooking(userId, params.id);
    }

    return NextResponse.json({ message: `Booking ${action.toLowerCase()}ed successfully`, result });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const isForbidden = error?.message?.includes("Forbidden");
    return NextResponse.json(
      { error: error?.message || "Failed to update booking" },
      { status: isForbidden ? 403 : 400 }
    );
  }
}
