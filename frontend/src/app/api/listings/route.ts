import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listingsService } from "@coop/backend/server/services/listings.service";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const viewerId = (session?.user as any)?.id;

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId") || undefined;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const listings = await listingsService.getListings(viewerId, {
      groupId,
      category,
      search,
    });

    return NextResponse.json({ listings }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch job listings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const ownerId = (session?.user as any)?.id;

    if (!ownerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const listing = await listingsService.createListing(ownerId, body);

    return NextResponse.json(
      {
        message:
          listing.visibility === "DIRECT"
            ? "Direct job offer sent to your trusted worker"
            : "Job posted publicly to your local ward",
        listing,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (
      error?.message?.includes("active member") ||
      error?.message?.includes("trusted worker")
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: error?.message || "Failed to create job listing" },
      { status: 500 }
    );
  }
}