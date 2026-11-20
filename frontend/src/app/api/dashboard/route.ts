import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dashboardService } from "@coop/backend/server/services/dashboard.service";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const callerUserId = (session?.user as any)?.id;

    if (!callerUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");
    const targetUserId = searchParams.get("targetUserId") || callerUserId;

    // If groupId is provided and request asks for group stats:
    if (groupId && searchParams.get("scope") === "group") {
      const groupData = await dashboardService.getGroupDashboard(callerUserId, groupId);
      return NextResponse.json(groupData);
    }

    // Otherwise, return member dashboard view
    const memberData = await dashboardService.getMemberDashboard(
      callerUserId,
      targetUserId,
      groupId || undefined
    );

    return NextResponse.json(memberData);
  } catch (error: any) {
    const isForbidden = error?.message?.includes("Forbidden");
    return NextResponse.json(
      { error: error?.message || "Failed to load dashboard data" },
      { status: isForbidden ? 403 : 500 }
    );
  }
}
