import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { friendsService } from "@coop/backend/server/services/friends.service";
import { ZodError } from "zod";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const overview = await friendsService.getConnectionsOverview(userId);
    return NextResponse.json(overview, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load trusted workers" },
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
    const connection = await friendsService.sendRequest(ownerId, body.workerId);

    return NextResponse.json(
      {
        message: "Trusted worker request sent",
        connection,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request payload", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (
      error?.message?.includes("already") ||
      error?.message?.includes("cannot add yourself")
    ) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error?.message?.includes("not found")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error?.message || "Failed to send trusted worker request" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const workerId = (session?.user as any)?.id;

    if (!workerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const updated = await friendsService.respondToRequest(
      workerId,
      body.connectionId,
      body.status
    );

    return NextResponse.json(
      {
        message: `Request ${body.status.toLowerCase()}`,
        connection: updated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request payload", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (error?.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error?.message?.includes("not found")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error?.message || "Failed to update request" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const connectionId = searchParams.get("connectionId");

    if (!connectionId) {
      return NextResponse.json({ error: "connectionId is required" }, { status: 400 });
    }

    await friendsService.removeConnection(userId, connectionId);
    return NextResponse.json({ message: "Connection removed" }, { status: 200 });
  } catch (error: any) {
    if (error?.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: error?.message || "Failed to remove connection" },
      { status: 500 }
    );
  }
}