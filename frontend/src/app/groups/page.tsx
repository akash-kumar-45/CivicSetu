"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import {
  Users,
  Plus,
  Check,
  X,
  Ban,
  AlertCircle,
  Sparkles,
  MapPin,
  BadgeCheck,
  UserPlus,
  UserCheck,
  Clock,
} from "lucide-react";

export default function GroupsPage() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupLocality, setNewGroupLocality] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Ward / Society directory & admin review modal state
  const [selectedGroupDetails, setSelectedGroupDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Trusted Circle tracking
  const [trustedIds, setTrustedIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null);

  const currentUserId = (session?.user as any)?.id;

  useEffect(() => {
    loadGroups();
    if (session?.user) {
      loadTrustedCircle();
    }
  }, [session]);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/groups");
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      }
    } catch {
      setActionError("Failed to load local wards & societies");
    } finally {
      setLoading(false);
    }
  };

  const loadTrustedCircle = async () => {
    try {
      const res = await fetch("/api/friends");
      if (res.ok) {
        const data = await res.json();
        setTrustedIds(new Set((data.trustedWorkers || []).map((w: any) => w.id)));
        setPendingIds(new Set((data.outgoingRequests || []).map((r: any) => r.workerId)));
      }
    } catch {
      // Non-blocking
    }
  };

  const handleAddToTrustedCircle = async (workerId: string, workerName: string) => {
    setInvitingUserId(workerId);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId }),
      });

      const data = await res.json();
      if (res.ok) {
        setPendingIds((prev) => new Set(prev).add(workerId));
        setActionSuccess(
          `Trusted Circle invitation sent to ${workerName}. Once accepted, you can offer them jobs directly!`
        );
      } else {
        setActionError(data.error || "Could not send trusted worker request");
      }
    } catch {
      setActionError("Network error while sending invitation");
    } finally {
      setInvitingUserId(null);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName, locality: newGroupLocality }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewGroupName("");
        setNewGroupLocality("");
        setActionSuccess("Local Ward / Society hub established! You are the Ward Coordinator.");
        loadGroups();
      } else {
        const data = await res.json();
        setActionError(data.error || "Failed to create ward hub");
      }
    } catch {
      setActionError("An error occurred while creating ward hub");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinRequest = async (groupId: string) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await fetch(`/api/groups/${groupId}/join`, {
        method: "POST",
      });

      const data = await res.json();
      if (res.ok) {
        setActionSuccess("Ward verification request submitted! Awaiting coordinator approval.");
        loadGroups();
      } else {
        setActionError(data.error || "Failed to join ward");
      }
    } catch {
      setActionError("An error occurred while submitting join request");
    }
  };

  const openAdminReview = async (groupId: string) => {
    setLoadingDetails(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedGroupDetails(data.group);
      } else {
        const data = await res.json();
        setActionError(data.error || "Failed to load ward directory");
      }
    } catch {
      setActionError("Error fetching ward member directory");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleMemberAction = async (
    groupId: string,
    targetUserId: string,
    action: "APPROVE" | "REJECT" | "SUSPEND"
  ) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/members/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, action }),
      });

      if (res.ok) {
        openAdminReview(groupId);
        loadGroups();
      } else {
        const data = await res.json();
        setActionError(data.error || "Failed to update resident status");
      }
    } catch {
      setActionError("Failed to update membership");
    }
  };

  return (
    <div className="min-h-screen bg-pureWhite text-darkText flex flex-col pt-16">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-borderLight">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron/10 border border-saffron/40 text-saffron font-mono text-xs uppercase mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>Civic Wards & Housing Societies</span>
            </div>
            <h1 className="text-3xl font-black text-govBlue-900">Local Wards & RWA Hubs</h1>
            <p className="text-xs text-mutedText mt-1">
              Verified neighborhood clusters for e-KYC residents, workers, and housing societies.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="py-3 px-5 rounded-xl bg-saffron text-pureWhite font-bold hover:bg-saffron-dark transition shadow-saffron-sm flex items-center gap-2 text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Ward / RWA Hub</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {actionError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{actionError}</span>
          </div>
        )}

        {actionSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-indiaGreen text-xs font-semibold flex items-center gap-2 shadow-gov-sm">
            <Sparkles className="w-4 h-4 shrink-0 text-indiaGreen" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Wards Grid */}
        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-mutedText">
            Loading verified local wards...
          </div>
        ) : groups.length === 0 ? (
          <div className="py-20 text-center rounded-3xl gov-panel border border-borderLight">
            <Users className="w-10 h-10 text-mutedText mx-auto mb-3" />
            <h3 className="text-lg font-bold text-govBlue-900">No local wards registered yet</h3>
            <p className="text-xs text-mutedText mt-1 mb-4">
              Be the first to register your municipal ward or housing society hub.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="py-2.5 px-4 rounded-xl bg-saffron text-pureWhite font-bold text-xs"
            >
              Register Ward Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => {
              const status = group.userMembershipStatus;
              return (
                <div
                  key={group.id}
                  className="rounded-2xl gov-panel-blue border border-govBlue-800/20 p-6 flex flex-col justify-between hover:border-govBlue-800/50 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-lightBg border border-borderLight text-[10px] font-mono text-mutedText uppercase">
                        {group.locality}
                      </span>

                      {status === "ACTIVE" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-indiaGreen/20 border border-indiaGreen/40 text-[10px] font-mono text-indiaGreen font-bold">
                          VERIFIED RESIDENT
                        </span>
                      )}
                      {status === "PENDING" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono text-amber-600 font-bold">
                          PENDING APPROVAL
                        </span>
                      )}
                      {status === "SUSPENDED" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[10px] font-mono text-red-600 font-bold">
                          SUSPENDED
                        </span>
                      )}
                      {!status && (
                        <span className="px-2.5 py-0.5 rounded-full bg-lightBg border border-borderLight text-[10px] font-mono text-mutedText">
                          OPEN WARD
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-govBlue-900 mb-1">{group.name}</h3>
                    <p className="text-xs text-mutedText mb-4">
                      Area / Sector: <span className="text-bodyText font-medium">{group.locality}</span>
                    </p>

                    <div className="grid grid-cols-2 gap-2 py-3 border-y border-borderLight text-xs font-mono mb-4">
                      <div>
                        <span className="text-mutedText block text-[10px] uppercase">Verified Neighbors</span>
                        <span className="font-bold text-saffron">{group.activeMembersCount} Active</span>
                      </div>
                      <div>
                        <span className="text-mutedText block text-[10px] uppercase">Local Jobs</span>
                        <span className="font-bold text-govBlue-900">{group.activeListingsCount} Open</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    {!status ? (
                      <button
                        onClick={() => handleJoinRequest(group.id)}
                        className="w-full py-2.5 px-4 rounded-xl bg-saffron text-pureWhite font-bold hover:bg-saffron-dark transition text-xs shadow-saffron-sm cursor-pointer"
                      >
                        Request Ward Membership
                      </button>
                    ) : status === "ACTIVE" ? (
                      <button
                        onClick={() => openAdminReview(group.id)}
                        disabled={loadingDetails}
                        className="w-full py-2.5 px-4 rounded-xl bg-pureWhite border border-govBlue-800/40 text-govBlue-800 hover:bg-govBlue-800/10 transition text-xs font-semibold cursor-pointer"
                      >
                        View Ward Directory & Trusted Workers
                      </button>
                    ) : (
                      <span className="text-xs text-mutedText font-mono py-2">
                        {status === "PENDING" ? "Awaiting ward coordinator approval" : "Access suspended"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Create Ward / Society Hub */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-govBlue-950/60 backdrop-blur-md">
            <div className="w-full max-w-md p-6 rounded-3xl gov-panel-saffron border border-saffron/40 shadow-gov-md">
              <h3 className="text-xl font-bold text-govBlue-900 mb-1">Register Ward / RWA Hub</h3>
              <p className="text-xs text-mutedText mb-4">
                You will be assigned as the Ward Coordinator to verify local residents and workers.
              </p>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-bodyText uppercase mb-1">
                    Ward / Society Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Gomti Nagar Ward 14 RWA"
                    className="w-full px-3 py-2.5 rounded-lg bg-lightBg border border-borderLight text-darkText text-xs focus:border-govBlue-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-bodyText uppercase mb-1">
                    Locality / Sector
                  </label>
                  <input
                    type="text"
                    required
                    value={newGroupLocality}
                    onChange={(e) => setNewGroupLocality(e.target.value)}
                    placeholder="Vibhav Khand, Lucknow"
                    className="w-full px-3 py-2.5 rounded-lg bg-lightBg border border-borderLight text-darkText text-xs focus:border-govBlue-800 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 rounded-lg bg-lightBg border border-borderLight text-xs text-mutedText hover:text-darkText"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-lg bg-saffron text-pureWhite font-bold hover:bg-saffron-dark text-xs shadow-gov-sm"
                  >
                    {submitting ? "Creating..." : "Establish Ward Hub"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Ward Directory & Admin Member Management */}
        {selectedGroupDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-govBlue-950/60 backdrop-blur-md">
            <div className="w-full max-w-2xl p-6 rounded-3xl gov-panel-saffron border border-saffron/40 shadow-gov-md max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-borderLight mb-4">
                <div>
                  <h3 className="text-lg font-bold text-govBlue-900">
                    {selectedGroupDetails.name} • Verified Directory
                  </h3>
                  <span className="text-xs text-mutedText font-mono">
                    Locality: {selectedGroupDetails.locality}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedGroupDetails(null)}
                  className="p-1.5 rounded-lg bg-lightBg text-mutedText hover:text-darkText"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedGroupDetails.members ? (
                <div className="space-y-3">
                  {selectedGroupDetails.members.map((m: any) => {
                    const isSelf = m.userId === currentUserId;
                    const isTrusted = trustedIds.has(m.userId);
                    const isPending = pendingIds.has(m.userId);

                    return (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-xl bg-lightBg border border-borderLight flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-darkText">{m.user.name}</span>
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-indiaGreen font-semibold">
                              <BadgeCheck className="w-3.5 h-3.5" /> Gov-ID Verified
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-lightBlueBg text-mutedText">
                              {m.user.role}
                            </span>
                          </div>
                          <span className="text-[11px] text-mutedText font-mono">{m.user.email}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Add to Trusted Circle Button for Active Neighbors */}
                          {m.status === "ACTIVE" && !isSelf && (
                            isTrusted ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-indiaGreen text-[10px] font-mono font-bold">
                                <UserCheck className="w-3 h-3" /> Trusted Worker
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-mono font-semibold">
                                <Clock className="w-3 h-3" /> Invite Sent
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={invitingUserId === m.userId}
                                onClick={() => handleAddToTrustedCircle(m.userId, m.user.name)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-indiaGreen text-[11px] font-bold hover:bg-emerald-100 transition cursor-pointer disabled:opacity-50"
                              >
                                <UserPlus className="w-3 h-3" />
                                <span>
                                  {invitingUserId === m.userId ? "Sending..." : "Add to Trusted Circle"}
                                </span>
                              </button>
                            )
                          )}

                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                              m.status === "ACTIVE"
                                ? "bg-indiaGreen/20 text-indiaGreen"
                                : m.status === "PENDING"
                                ? "bg-amber-500/20 text-amber-600"
                                : "bg-red-500/20 text-red-600"
                            }`}
                          >
                            {m.status}
                          </span>

                          {selectedGroupDetails.isCallerAdmin && (
                            <div className="flex gap-1">
                              {m.status === "PENDING" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleMemberAction(selectedGroupDetails.id, m.userId, "APPROVE")
                                    }
                                    title="Approve resident"
                                    className="p-1.5 rounded bg-saffron text-pureWhite font-bold hover:bg-saffron-dark text-xs cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleMemberAction(selectedGroupDetails.id, m.userId, "REJECT")
                                    }
                                    title="Reject request"
                                    className="p-1.5 rounded bg-red-600 text-pureWhite hover:bg-red-700 text-xs cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}

                              {m.status === "ACTIVE" && !isSelf && (
                                <button
                                  onClick={() =>
                                    handleMemberAction(selectedGroupDetails.id, m.userId, "SUSPEND")
                                  }
                                  title="Suspend resident"
                                  className="p-1.5 rounded bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 text-xs cursor-pointer"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-xs font-mono text-mutedText">
                  You are a verified resident of this ward. Admin controls are restricted to the ward coordinator.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}