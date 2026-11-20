import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { listingsService } from "@coop/backend/server/services/listings.service";
import { CreateListingSchema } from "@coop/backend/server/validators/listings.schema";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");
    const type = searchParams.get("type") as "OFFER" | "REQUEST" | null;
    const category = searchParams.get("category") || undefined;

    if (!groupId) {
      return NextResponse.json(
        { error: "groupId query parameter is required" },
        { status: 400 }
      );
    }

    const listings = await listingsService.listGroupListings(userId, groupId, {
      type: type || undefined,
      category,
    });

    return NextResponse.json({ listings });
  } catch (error: any) {
    const isForbidden = error?.message?.includes("Forbidden");
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve listings" },
      { status: isForbidden ? 403 : 500 }
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
    const validatedData = CreateListingSchema.parse(body);

    const listing = await listingsService.createListing(userId, validatedData);
    return NextResponse.json({ listing }, { status: 201 });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const isForbidden = error?.message?.includes("Forbidden");
    return NextResponse.json(
      { error: error?.message || "Failed to create listing" },
      { status: isForbidden ? 403 : 400 }
    );
  }
}
