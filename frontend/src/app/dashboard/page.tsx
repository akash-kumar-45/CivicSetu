"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Clock, ShieldCheck, Star, Users, ArrowUpRight, ArrowDownLeft, AlertCircle, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number>(0);
  const [ledgerHistory, setLedgerHistory] = useState<any[]>([]);
  const [ratingSummary, setRatingSummary] = useState<any>({ averageRating: 0, totalReviews: 0 });
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [groupStats, setGroupStats] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      loadDashboardData();
    }
  }, [session]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load user balance and ledger history
      const res = await fetch("/api/ledger");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance || 0);
        setLedgerHistory(data.history || []);
      }

      // Load user rating
      const userId = (session?.user as any)?.id;
      if (userId) {
        const revRes = await fetch(`/api/reviews?userId=${userId}`);
        if (revRes.ok) {
          const revData = await revRes.json();
          setRatingSummary(revData.summary || { averageRating: 0, totalReviews: 0 });
        }
      }

      // Load groups list
      const groupRes = await fetch("/api/groups");
      if (groupRes.ok) {
        const gData = await groupRes.json();
        setGroups(gData.groups || []);
        if (gData.groups?.length > 0) {
          const activeGroup = gData.groups.find((g: any) => g.userMembershipStatus === "ACTIVE") || gData.groups[0];
          setSelectedGroupId(activeGroup.id);
          loadGroupStats(activeGroup.id);
        }
      }
    } catch (e) {
      console.error("Failed to load dashboard data", e);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupStats = async (groupId: string) => {
    try {
      const res = await fetch(`/api/dashboard?groupId=${groupId}&scope=group`);
      if (res.ok) {
        const data = await res.json();
        setGroupStats(data.stats);
      } else {
        setGroupStats(null);
      }
    } catch {
      setGroupStats(null);
    }
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const gId = e.target.value;
    setSelectedGroupId(gId);
    loadGroupStats(gId);
  };

  return (
    <div className="min-h-screen bg-midnight-950 text-pureWhite flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-neon/10 border border-lime-neon/40 text-lime-neon font-mono text-xs uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cooperative Member Profile</span>
            </div>
            <h1 className="text-3xl font-black text-pureWhite">
              {(session?.user as any)?.name || "Member"} Dashboard
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Role: <span className="font-mono text-lime-neon">{(session?.user as any)?.role || "MEMBER"}</span> •
              Email: <span className="font-mono text-zinc-300">{session?.user?.email}</span>
            </p>
          </div>

          {/* Group Stats Selector */}
          {groups.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-mono text-zinc-400">Co-op Scope:</label>
              <select
                value={selectedGroupId}
                onChange={handleGroupChange}
                className="px-3 py-2 rounded-xl bg-midnight-900 border border-zinc-800 text-xs font-medium text-pureWhite focus:border-lime-neon focus:outline-none"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.locality})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Card 1: Time Credit Balance */}
          <div className="p-6 rounded-2xl glass-panel-lime border border-lime-neon/40 shadow-neon-sm">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Derived Balance</span>
              <Clock className="w-4 h-4 text-lime-neon" />
            </div>
            <div className="text-3xl font-black font-mono text-lime-neon">{balance} Credits</div>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              1 Hour = 1 Credit • Dynamically Audited
            </span>
          </div>

          {/* Card 2: Mutual Rating */}
          <div className="p-6 rounded-2xl glass-panel border border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Community Rating</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div className="text-3xl font-black font-mono text-pureWhite">
              {ratingSummary.averageRating > 0 ? `${ratingSummary.averageRating} / 5` : "Unrated"}
            </div>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              {ratingSummary.totalReviews} verified post-booking reviews
            </span>
          </div>

          {/* Card 3: Group Active Members */}
          <div className="p-6 rounded-2xl glass-panel border border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Active Group Members</span>
              <Users className="w-4 h-4 text-lime-bright" />
            </div>
            <div className="text-3xl font-black font-mono text-pureWhite">
              {groupStats ? groupStats.activeMembers : "..."}
            </div>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Vetted local cooperative members
            </span>
          </div>

          {/* Card 4: Credits in Circulation */}
          <div className="p-6 rounded-2xl glass-panel border border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Circulating Volume</span>
              <ShieldCheck className="w-4 h-4 text-lime-neon" />
            </div>
            <div className="text-3xl font-black font-mono text-lime-bright">
              {groupStats ? `${groupStats.creditsInCirculation} Credits` : "..."}
            </div>
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Total hours exchanged in group
            </span>
          </div>
        </div>

        {/* Append-Only Ledger Transaction Audit Table */}
        <div className="rounded-3xl glass-panel border border-zinc-800 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-pureWhite flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-lime-neon" />
                <span>Personal Append-Only Ledger History</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Every record is permanently audited. Balances are derived, never updated in place.
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-midnight-900 border border-zinc-800 text-xs font-mono text-zinc-400">
              Total Entries: {ledgerHistory.length}
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-zinc-500">
              Auditing ledger transactions...
            </div>
          ) : ledgerHistory.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">No time-credit transactions posted yet.</p>
              <p className="text-xs text-zinc-500 mt-1">
                Complete your first booking to record credits on the append-only ledger.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Counterparty</th>
                    <th className="py-3 px-4">Co-op Group</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {ledgerHistory.map((tx) => (
                    <tr key={tx.id} className="hover:bg-midnight-900/40 transition">
                      <td className="py-3 px-4 text-zinc-400 truncate max-w-[120px]">
                        {tx.id.slice(0, 8)}...
                      </td>
                      <td className="py-3 px-4">
                        {tx.type === "CREDIT" ? (
                          <span className="inline-flex items-center gap-1 text-lime-neon font-bold">
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            RECEIVED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 font-bold">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            SENT
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-pureWhite">
                        {tx.type === "CREDIT" ? `+${tx.amount}` : `-${tx.amount}`} Credits
                      </td>
                      <td className="py-3 px-4 text-zinc-300">
                        {tx.counterparty?.name || tx.counterparty?.email || "Community Reserve"}
                      </td>
                      <td className="py-3 px-4 text-zinc-400">{tx.groupName || "Main Co-op"}</td>
                      <td className="py-3 px-4 text-zinc-500">
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
