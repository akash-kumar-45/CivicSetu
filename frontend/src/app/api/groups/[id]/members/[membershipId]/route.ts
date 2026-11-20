import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groupsService } from "@coop/backend/server/services/groups.service";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; membershipId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const adminUserId = (session?.user as any)?.id;

    if (!adminUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, targetUserId } = body;

    if (!action || !targetUserId) {
      return NextResponse.json(
        { error: "Action and targetUserId are required" },
        { status: 400 }
      );
    }

    if (action === "APPROVE") {
      const result = await groupsService.approveMember(adminUserId, params.id, targetUserId);
      return NextResponse.json({ message: "Member approved", result });
    } else if (action === "REJECT") {
      const result = await groupsService.rejectMember(adminUserId, params.id, targetUserId);
      return NextResponse.json({ message: "Member rejected", result });
    } else if (action === "SUSPEND") {
      const result = await groupsService.suspendMember(adminUserId, params.id, targetUserId);
      return NextResponse.json({ message: "Member suspended", result });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    const isForbidden = error?.message?.includes("Forbidden");
    return NextResponse.json(
      { error: error?.message || "Failed to update member status" },
      { status: isForbidden ? 403 : 400 }
    );
  }
}
