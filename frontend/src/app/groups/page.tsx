"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Users, Plus, ShieldCheck, Check, X, Ban, AlertCircle, Sparkles } from "lucide-react";

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

  // Admin member review modal state
  const [selectedGroupDetails, setSelectedGroupDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadGroups();
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
      setActionError("Failed to load cooperative groups");
    } finally {
      setLoading(false);
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
        setActionSuccess("Cooperative group created! You are now the group admin.");
        loadGroups();
      } else {
        const data = await res.json();
        setActionError(data.error || "Failed to create group");
      }
    } catch {
      setActionError("An error occurred while creating group");
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
        setActionSuccess("Join request submitted! Awaiting group admin approval.");
        loadGroups();
      } else {
        setActionError(data.error || "Failed to join group");
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
        setActionError(data.error || "Failed to load group members");
      }
    } catch {
      setActionError("Error fetching group admin details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleMemberAction = async (groupId: string, targetUserId: string, action: "APPROVE" | "REJECT" | "SUSPEND") => {
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
        setActionError(data.error || "Failed to perform member action");
      }
    } catch {
      setActionError("Failed to update membership");
    }
  };

  return (
    <div className="min-h-screen bg-midnight-950 text-pureWhite flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-neon/10 border border-lime-neon/40 text-lime-neon font-mono text-xs uppercase mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Cooperative Communities</span>
            </div>
            <h1 className="text-3xl font-black text-pureWhite">Local Co-op Groups</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Autonomous, isolated cooperative groups for neighborhoods, hostels, and housing societies.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="py-3 px-5 rounded-xl bg-lime-neon text-midnight-950 font-bold hover:bg-lime-bright transition shadow-neon-sm flex items-center gap-2 text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Co-op Group</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {actionError && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{actionError}</span>
          </div>
        )}

        {actionSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-lime-950/60 border border-lime-neon/40 text-lime-neon text-xs flex items-center gap-2 shadow-neon-sm">
            <Sparkles className="w-4 h-4 shrink-0 text-lime-neon" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Groups Grid */}
        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-zinc-500">
            Loading cooperative groups...
          </div>
        ) : groups.length === 0 ? (
          <div className="py-20 text-center rounded-3xl glass-panel border border-zinc-800">
            <Users className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-pureWhite">No cooperative groups yet</h3>
            <p className="text-xs text-zinc-400 mt-1 mb-4">
              Be the first to create a cooperative group in your locality.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="py-2.5 px-4 rounded-xl bg-lime-neon text-midnight-950 font-bold text-xs"
            >
              Create Group Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => {
              const status = group.userMembershipStatus;
              return (
                <div
                  key={group.id}
                  className="rounded-2xl glass-panel-lime border border-lime-neon/20 p-6 flex flex-col justify-between hover:border-lime-neon/50 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-midnight-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase">
                        {group.locality}
                      </span>

                      {status === "ACTIVE" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-lime-neon/20 border border-lime-neon/40 text-[10px] font-mono text-lime-neon font-bold">
                          ACTIVE MEMBER
                        </span>
                      )}
                      {status === "PENDING" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono text-amber-400 font-bold">
                          PENDING APPROVAL
                        </span>
                      )}
                      {status === "SUSPENDED" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[10px] font-mono text-red-400 font-bold">
                          SUSPENDED
                        </span>
                      )}
                      {!status && (
                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-500">
                          NON-MEMBER
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-pureWhite mb-1">{group.name}</h3>
                    <p className="text-xs text-zinc-400 mb-4">
                      Locality: <span className="text-zinc-300 font-medium">{group.locality}</span>
                    </p>

                    <div className="grid grid-cols-2 gap-2 py-3 border-y border-zinc-800/80 text-xs font-mono mb-4">
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase">Members</span>
                        <span className="font-bold text-lime-neon">{group.activeMembersCount} Active</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase">Listings</span>
                        <span className="font-bold text-pureWhite">{group.activeListingsCount} Available</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    {!status ? (
                      <button
                        onClick={() => handleJoinRequest(group.id)}
                        className="w-full py-2.5 px-4 rounded-xl bg-lime-neon text-midnight-950 font-bold hover:bg-lime-bright transition text-xs shadow-neon-sm cursor-pointer"
                      >
                        Request to Join
                      </button>
                    ) : status === "ACTIVE" ? (
                      <button
                        onClick={() => openAdminReview(group.id)}
                        className="w-full py-2.5 px-4 rounded-xl bg-midnight-900 border border-lime-neon/40 text-lime-neon hover:bg-lime-neon/10 transition text-xs font-semibold cursor-pointer"
                      >
                        Manage & View Members
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-500 font-mono py-2">
                        {status === "PENDING" ? "Awaiting admin confirmation" : "Access suspended"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Create Group */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md">
            <div className="w-full max-w-md p-6 rounded-3xl glass-panel-lime border border-lime-neon/40 shadow-neon-md">
              <h3 className="text-xl font-bold text-pureWhite mb-1">Create Cooperative Group</h3>
              <p className="text-xs text-zinc-400 mb-4">
                You will be assigned as the primary administrator with approval authority.
              </p>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 uppercase mb-1">Group Name</label>
                  <input
                    type="text"
                    required
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Maple Street Housing Co-op"
                    className="w-full px-3 py-2.5 rounded-lg bg-midnight-900 border border-zinc-800 text-pureWhite text-xs focus:border-lime-neon focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 uppercase mb-1">Locality / Sector</label>
                  <input
                    type="text"
                    required
                    value={newGroupLocality}
                    onChange={(e) => setNewGroupLocality(e.target.value)}
                    placeholder="North District, Sector 4"
                    className="w-full px-3 py-2.5 rounded-lg bg-midnight-900 border border-zinc-800 text-pureWhite text-xs focus:border-lime-neon focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 rounded-lg bg-midnight-900 border border-zinc-800 text-xs text-zinc-400 hover:text-pureWhite"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-lg bg-lime-neon text-midnight-950 font-bold hover:bg-lime-bright text-xs shadow-neon-sm"
                  >
                    {submitting ? "Creating..." : "Establish Group"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Admin Member Management */}
        {selectedGroupDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md">
            <div className="w-full max-w-2xl p-6 rounded-3xl glass-panel-lime border border-lime-neon/40 shadow-neon-md max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-pureWhite">
                    {selectedGroupDetails.name} • Members
                  </h3>
                  <span className="text-xs text-zinc-400 font-mono">
                    Locality: {selectedGroupDetails.locality}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedGroupDetails(null)}
                  className="p-1 rounded bg-midnight-900 text-zinc-400 hover:text-pureWhite"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedGroupDetails.members ? (
                <div className="space-y-3">
                  {selectedGroupDetails.members.map((m: any) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-midnight-900/80 border border-zinc-800 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-pureWhite">{m.user.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                            {m.user.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400 font-mono">{m.user.email}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            m.status === "ACTIVE"
                              ? "bg-lime-neon/20 text-lime-neon"
                              : m.status === "PENDING"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {m.status}
                        </span>

                        {selectedGroupDetails.isCallerAdmin && (
                          <div className="flex gap-1">
                            {m.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleMemberAction(selectedGroupDetails.id, m.userId, "APPROVE")}
                                  title="Approve member"
                                  className="p-1.5 rounded bg-lime-neon text-midnight-950 font-bold hover:bg-lime-bright text-xs cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleMemberAction(selectedGroupDetails.id, m.userId, "REJECT")}
                                  title="Reject member"
                                  className="p-1.5 rounded bg-red-900 text-red-200 hover:bg-red-800 text-xs cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {m.status === "ACTIVE" && m.userId !== (session?.user as any)?.id && (
                              <button
                                onClick={() => handleMemberAction(selectedGroupDetails.id, m.userId, "SUSPEND")}
                                title="Suspend member"
                                className="p-1.5 rounded bg-red-950/70 border border-red-500/40 text-red-300 hover:bg-red-900 text-xs cursor-pointer"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs font-mono text-zinc-400">
                  You are an active member of this group. Admin controls are restricted to the group administrator.
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
