import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { reviewsService } from "@coop/backend/server/services/reviews.service";
import { CreateReviewSchema } from "@coop/backend/server/validators/reviews.schema";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");
    const userId = searchParams.get("userId");

    if (bookingId) {
      const reviews = await reviewsService.listBookingReviews(bookingId);
      return NextResponse.json({ reviews });
    }

    if (userId) {
      const summary = await reviewsService.getUserRatingSummary(userId);
      return NextResponse.json({ summary });
    }

    return NextResponse.json(
      { error: "Query parameter bookingId or userId is required" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve reviews" },
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
    const validatedData = CreateReviewSchema.parse(body);

    const review = await reviewsService.createReview(userId, validatedData);
    return NextResponse.json({ message: "Review submitted successfully", review }, { status: 201 });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const isForbidden = error?.message?.includes("Forbidden");
    return NextResponse.json(
      { error: error?.message || "Failed to submit review" },
      { status: isForbidden ? 403 : 400 }
    );
  }
}
