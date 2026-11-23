"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import {
  ShieldCheck,
  Star,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  BadgeCheck,
  MapPin,
  Briefcase,
  PlusCircle,
  IndianRupee,
  ClipboardCheck,
} from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [totalSettled, setTotalSettled] = useState<number>(0);
  const [settlementHistory, setSettlementHistory] = useState<any[]>([]);
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
      // Load direct payout/settlement logs from existing ledger endpoint
      const res = await fetch("/api/ledger");
      if (res.ok) {
        const data = await res.json();
        const history = data.history || [];
        setSettlementHistory(history);
        const volume = history.reduce((acc: number, tx: any) => acc + (tx.amount || 0), 0);
        setTotalSettled(volume);
      }

      // Load mutual user rating
      const userId = (session?.user as any)?.id;
      if (userId) {
        const revRes = await fetch(`/api/reviews?userId=${userId}`);
        if (revRes.ok) {
          const revData = await revRes.json();
          setRatingSummary(revData.summary || { averageRating: 0, totalReviews: 0 });
        }
      }

      // Load local wards / groups list
      const groupRes = await fetch("/api/groups");
      if (groupRes.ok) {
        const gData = await groupRes.json();
        setGroups(gData.groups || []);
        if (gData.groups?.length > 0) {
          const activeGroup =
            gData.groups.find((g: any) => g.userMembershipStatus === "ACTIVE") || gData.groups[0];
          setSelectedGroupId(activeGroup.id);
          loadGroupStats(activeGroup.id);
        }
      }
    } catch (e) {
      console.error("Failed to load civic dashboard data", e);
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

  const user = session?.user as any;
  const userIntentLabel =
    user?.userIntent === "OWNER"
      ? "Citizen (Hiring)"
      : user?.userIntent === "WORKER"
      ? "Local Worker"
      : "Citizen & Worker";

  return (
    <div className="min-h-screen bg-pureWhite text-darkText flex flex-col pt-16">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8 pb-6 border-b border-borderLight">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-indiaGreen font-mono text-xs font-bold">
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>{user?.isVerified !== false ? "Gov-ID e-KYC Verified" : "Pending e-KYC"}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-saffron/10 border border-saffron/30 text-saffron font-mono text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>{user?.ward || "Local Ward"}</span>
              </span>
            </div>

            <h1 className="text-3xl font-black text-govBlue-900">
              {user?.name || "Citizen"}&apos;s Civic Hub
            </h1>
            <p className="text-xs text-mutedText mt-1">
              Mode: <span className="font-mono font-semibold text-saffron">{userIntentLabel}</span> •
              Email: <span className="font-mono text-bodyText">{session?.user?.email}</span>
            </p>
          </div>

          {/* Quick Actions & Ward Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/listings"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-saffron text-pureWhite text-xs font-bold hover:bg-saffron-dark transition shadow-saffron-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post / Browse Jobs</span>
            </Link>

            <Link
              href="/bookings"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-govBlue-900 text-pureWhite text-xs font-semibold hover:bg-govBlue-800 transition"
            >
              <ClipboardCheck className="w-4 h-4 text-saffron" />
              <span>My Hires & Work</span>
            </Link>

            {groups.length > 0 && (
              <select
                value={selectedGroupId}
                onChange={handleGroupChange}
                className="px-3 py-2.5 rounded-xl bg-lightBg border border-borderLight text-xs font-medium text-darkText focus:border-govBlue-800 focus:outline-none"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.locality})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Worker Skills Banner (if any skills registered) */}
        {user?.skills?.length > 0 && (
          <div className="mb-8 p-4 rounded-2xl bg-lightBg border border-borderLight flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-govBlue-900 uppercase flex items-center gap-1.5 mr-1">
                <Briefcase className="w-3.5 h-3.5 text-saffron" />
                Verified Public Skills:
              </span>
              {user.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-full bg-pureWhite border border-borderLight text-xs font-medium text-bodyText"
                >
                  {skill}
                </span>
              ))}
            </div>
            
          </div>
        )}

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Card 1: Direct Settlement Volume */}
          <div className="p-6 rounded-2xl gov-panel-saffron border border-saffron/40 shadow-saffron-sm">
            <div className="flex items-center justify-between text-mutedText mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Direct Work Volume</span>
              <IndianRupee className="w-4 h-4 text-saffron" />
            </div>
            <div className="text-3xl font-black font-mono text-saffron">₹{totalSettled}</div>
            <span className="text-[11px] text-mutedText mt-1 block">
              ₹0 Platform Cut • Settled via UPI / Cash
            </span>
          </div>

          {/* Card 2: Mutual Trust Rating */}
          <div className="p-6 rounded-2xl gov-panel border border-borderLight">
            <div className="flex items-center justify-between text-mutedText mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Mutual Trust Score</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div className="text-3xl font-black font-mono text-darkText">
              {ratingSummary.averageRating > 0 ? `${ratingSummary.averageRating} / 5` : "New Profile"}
            </div>
            <span className="text-[11px] text-mutedText mt-1 block">
              {ratingSummary.totalReviews} verified post-job ratings
            </span>
          </div>

          {/* Card 3: Verified Ward Neighbors */}
          <div className="p-6 rounded-2xl gov-panel border border-borderLight">
            <div className="flex items-center justify-between text-mutedText mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Verified Ward Users</span>
              <Users className="w-4 h-4 text-indiaGreen" />
            </div>
            <div className="text-3xl font-black font-mono text-darkText">
              {groupStats ? groupStats.activeMembers : "Active"}
            </div>
            <span className="text-[11px] text-mutedText mt-1 block">
              e-KYC verified neighbors in {user?.ward || "your ward"}
            </span>
          </div>

          {/* Card 4: Privacy & Safety Guard */}
          <div className="p-6 rounded-2xl gov-panel border border-borderLight">
            <div className="flex items-center justify-between text-mutedText mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Address Privacy</span>
              <ShieldCheck className="w-4 h-4 text-indiaGreen" />
            </div>
            <div className="text-3xl font-black font-mono text-indiaGreen">2-Stage</div>
            <span className="text-[11px] text-mutedText mt-1 block">
              Exact address unlocks only after worker hire
            </span>
          </div>
        </div>

        {/* Direct Settlement & Completed Work Log Table */}
        <div className="rounded-3xl gov-panel border border-borderLight p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-govBlue-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-saffron" />
                <span>Direct Settlement & Work Audit Log</span>
              </h2>
              <p className="text-xs text-mutedText mt-1">
                Verified record of completed jobs and direct peer-to-peer payouts (₹0 portal fee).
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-lightBg border border-borderLight text-xs font-mono text-mutedText">
              Completed Records: {settlementHistory.length}
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-mutedText">
              Loading civic work records...
            </div>
          ) : settlementHistory.length === 0 ? (
            <div className="py-12 text-center">
              <Briefcase className="w-8 h-8 text-mutedText mx-auto mb-2" />
              <p className="text-sm font-medium text-darkText">No completed jobs recorded yet.</p>
              <p className="text-xs text-mutedText mt-1 mb-4">
                Post a local task or apply to open jobs in {user?.ward || "your ward"} to get started.
              </p>
              <Link
                href="/listings"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-saffron text-pureWhite text-xs font-bold hover:bg-saffron-dark transition"
              >
                Explore Local Jobs
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-borderLight text-mutedText uppercase tracking-wider">
                    <th className="py-3 px-4">Work ID</th>
                    <th className="py-3 px-4">Direction</th>
                    <th className="py-3 px-4">Direct Payout</th>
                    <th className="py-3 px-4">Verified Neighbor</th>
                    <th className="py-3 px-4">Local Ward</th>
                    <th className="py-3 px-4">Completed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderLight">
                  {settlementHistory.map((tx) => (
                    <tr key={tx.id} className="hover:bg-lightBlueBg/50 transition">
                      <td className="py-3 px-4 text-mutedText truncate max-w-[120px]">
                        {tx.id.slice(0, 8)}...
                      </td>
                      <td className="py-3 px-4">
                        {tx.type === "CREDIT" ? (
                          <span className="inline-flex items-center gap-1 text-indiaGreen font-bold">
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            EARNED (DIRECT)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-govBlue-900 font-bold">
                            <ArrowUpRight className="w-3.5 h-3.5 text-saffron" />
                            PAID DIRECTLY
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-darkText">₹{tx.amount}</td>
                      <td className="py-3 px-4 text-bodyText">
                        {tx.counterparty?.name || tx.counterparty?.email || "Verified Citizen"}
                      </td>
                      <td className="py-3 px-4 text-mutedText">{tx.groupName || user?.ward || "Local Ward"}</td>
                      <td className="py-3 px-4 text-mutedText">
                        {new Date(tx.createdAt).toLocaleDateString()}{" "}
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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