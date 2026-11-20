import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]/route";
import { ledgerService } from "@coop/backend/server/services/ledger.service";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId") || undefined;

    const balance = await ledgerService.getUserBalance(userId, groupId);
    const history = await ledgerService.getUserLedgerHistory(userId, groupId);

    return NextResponse.json({ balance, history });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve ledger data" },
      { status: 500 }
    );
  }
}
