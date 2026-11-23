"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import {
  MapPin,
  Lock,
  Unlock,
  BadgeCheck,
  IndianRupee,
  PlusCircle,
  Send,
  Globe,
  UserCheck,
  Search,
  Briefcase,
  Building2,
} from "lucide-react";

const CATEGORIES = [
  "ALL",
  "Electrical & Plumbing",
  "Home Repair & Carpentry",
  "Cleaning & Sanitization",
  "Tutoring & Education",
  "Elder Care & Errands",
  "Tech & Appliance Help",
];

function ListingsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const preselectedWorkerId = searchParams.get("directWorkerId");

  const [listings, setListings] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [trustedWorkers, setTrustedWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Create Job Modal State
  const [showCreateModal, setShowCreateModal] = useState(Boolean(preselectedWorkerId));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    groupId: "",
    category: "Electrical & Plumbing",
    title: "",
    description: "",
    hourlyCredits: 350,
    roughLocation: (session?.user as any)?.ward || "",
    exactAddress: "",
    visibility: preselectedWorkerId ? "DIRECT" : "PUBLIC",
    targetWorkerId: preselectedWorkerId || "",
  });

  // Apply / Accept Job State
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const currentUserId = (session?.user as any)?.id;

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInitialData();
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, session]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "ALL") params.set("category", selectedCategory);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const [listRes, grpRes, friendsRes] = await Promise.all([
        fetch(`/api/listings?${params.toString()}`),
        fetch("/api/groups"),
        session?.user ? fetch("/api/friends") : Promise.resolve(null),
      ]);

      if (listRes.ok) {
        const lData = await listRes.json();
        setListings(lData.listings || []);
      }

      if (grpRes.ok) {
        const gData = await grpRes.json();
        const activeGroups = (gData.groups || []).filter(
          (g: any) => g.userMembershipStatus === "ACTIVE"
        );
        setGroups(activeGroups);
        if (activeGroups.length > 0 && !formData.groupId) {
          setFormData((prev) => ({
            ...prev,
            groupId: activeGroups[0].id,
            roughLocation: prev.roughLocation || activeGroups[0].locality,
          }));
        }
      }

      if (friendsRes && friendsRes.ok) {
        const fData = await friendsRes.json();
        setTrustedWorkers(fData.trustedWorkers || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          type: "REQUEST",
          groupId: formData.groupId || null,
          targetWorkerId:
            formData.visibility === "DIRECT" ? formData.targetWorkerId : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const fieldMessages = data.details
          ? Object.values(data.details).flat().join(" • ")
          : "";
        throw new Error(
          fieldMessages ? `${data.error}: ${fieldMessages}` : data.error || "Failed to post job"
        );
      }

      setToastMsg(data.message);
      setShowCreateModal(false);
      setFormData((prev) => ({
        ...prev,
        title: "",
        description: "",
        exactAddress: "",
      }));
      await fetchInitialData();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyToJob = async (listing: any) => {
    setApplyingId(listing.id);
    setToastMsg("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          startsAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          durationMinutes: 60,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not apply for this job");
      }
      setToastMsg(
        "Application submitted! Exact address will unlock automatically once the citizen accepts."
      );
      await fetchInitialData();
    } catch (err: any) {
      setToastMsg(err.message);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-pureWhite text-darkText flex flex-col pt-16">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Top Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-borderLight">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron/10 border border-saffron/30 text-saffron font-mono text-xs font-bold mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>CivicSetu Job Board • ₹0 Commission</span>
            </span>
            <h1 className="text-3xl font-black text-govBlue-900">
              City-Wide Jobs, Ward Tasks & Direct Offers
            </h1>
            <p className="text-xs text-mutedText mt-1">
              Only rough locality is shown publicly. Exact house/street address unlocks strictly after worker selection.
            </p>
          </div>

          {session?.user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-saffron text-pureWhite text-xs font-bold hover:bg-saffron-dark transition shadow-saffron-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post a Job / Direct Offer</span>
            </button>
          )}
        </div>

        {toastMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-indiaGreen text-xs font-semibold flex items-center justify-between">
            <span>{toastMsg}</span>
            <button onClick={() => setToastMsg("")} className="underline ml-4">
              Dismiss
            </button>
          </div>
        )}

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-govBlue-900 text-pureWhite"
                    : "bg-lightBg border border-borderLight text-bodyText hover:border-govBlue-800/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-mutedText absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search title or ward..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchInitialData()}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-lightBg border border-borderLight text-xs focus:border-govBlue-800 focus:outline-none"
              />
            </div>
            <button
              onClick={fetchInitialData}
              className="px-4 py-2 rounded-xl bg-govBlue-900 text-pureWhite text-xs font-bold cursor-pointer"
            >
              Filter
            </button>
          </div>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-mutedText">
            Loading verified jobs...
          </div>
        ) : listings.length === 0 ? (
          <div className="py-16 text-center rounded-3xl gov-panel border border-borderLight">
            <Briefcase className="w-9 h-9 text-mutedText mx-auto mb-2" />
            <p className="text-sm font-bold text-darkText">No active jobs found in this filter</p>
            <p className="text-xs text-mutedText mt-1">
              Post a new requirement open to all workers or switch category filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((job) => {
              const isDirectOffer = job.visibility === "DIRECT";
              const isWardOnly = job.visibility === "WARD_ONLY";
              const isMyJob = currentUserId && job.ownerId === currentUserId;

              return (
                <div
                  key={job.id}
                  className={`rounded-3xl p-6 border flex flex-col justify-between transition ${
                    isDirectOffer
                      ? "bg-saffron/5 border-saffron/50 shadow-saffron-sm"
                      : "gov-panel border-borderLight"
                  }`}
                >
                  <div>
                    {/* Visibility & Category Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-lightBg border border-borderLight text-[11px] font-mono font-semibold text-govBlue-900">
                        {job.category}
                      </span>

                      {isDirectOffer ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-saffron text-pureWhite text-[11px] font-mono font-bold">
                          <Send className="w-3 h-3" />
                          {isMyJob
                            ? `Direct to ${job.targetWorker?.name || "Friend"}`
                            : "Private Direct Offer"}
                        </span>
                      ) : isWardOnly ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-mono font-semibold">
                          <Building2 className="w-3 h-3" /> Ward Only
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-govBlue-900 text-[11px] font-mono font-semibold">
                          <Globe className="w-3 h-3" /> Open to All Users
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-govBlue-900 mb-2">{job.title}</h3>
                    <p className="text-xs text-bodyText leading-relaxed mb-4">
                      {job.description}
                    </p>

                    {/* Two-Stage Location Privacy Box */}
                    <div className="p-3 rounded-2xl bg-lightBg border border-borderLight mb-4 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-darkText">
                        <MapPin className="w-3.5 h-3.5 text-saffron shrink-0" />
                        <span>Area: {job.roughLocation}</span>
                      </div>

                      {job.isAddressUnlocked && job.exactAddress ? (
                        <div className="flex items-start gap-1.5 text-[11px] font-mono text-indiaGreen font-semibold">
                          <Unlock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>Exact Address: {job.exactAddress}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-mutedText">
                          <Lock className="w-3.5 h-3.5 shrink-0" />
                          <span>Exact address locked until worker accepted</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer: Payout & Action */}
                  <div className="pt-4 border-t border-borderLight flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-mutedText block">
                        Direct Payout (₹0 Fee)
                      </span>
                      <span className="text-lg font-black font-mono text-indiaGreen flex items-center">
                        <IndianRupee className="w-4 h-4" />
                        {job.hourlyCredits}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-[11px] text-mutedText mb-1.5">
                        <span>{job.owner?.name}</span>
                        {job.owner?.isVerified && (
                          <BadgeCheck className="w-3.5 h-3.5 text-indiaGreen" />
                        )}
                      </div>

                      {!session?.user ? (
                        <span className="text-[11px] font-mono text-mutedText">
                          Sign in to apply
                        </span>
                      ) : isMyJob ? (
                        <span className="inline-block px-3 py-1.5 rounded-xl bg-lightBg border border-borderLight text-xs font-mono font-semibold text-govBlue-900">
                          Your Posting
                        </span>
                      ) : job.userBookingStatus === "REQUESTED" ? (
                        <span className="inline-block px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-mono font-bold text-amber-700">
                          Applied (Pending)
                        </span>
                      ) : job.userBookingStatus === "ACCEPTED" ? (
                        <span className="inline-block px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-indiaGreen">
                          Hired (Active)
                        </span>
                      ) : (
                        <button
                          disabled={applyingId === job.id}
                          onClick={() => handleApplyToJob(job)}
                          className="px-4 py-2 rounded-xl bg-saffron text-pureWhite text-xs font-bold hover:bg-saffron-dark transition disabled:opacity-50 cursor-pointer"
                        >
                          {applyingId === job.id
                            ? "Sending..."
                            : isDirectOffer
                            ? "Accept Direct Offer"
                            : "Apply for Work"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Job / Direct Offer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-pureWhite rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-borderLight shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-govBlue-900">
                Post Work or Direct Offer
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-xs font-mono text-mutedText hover:text-darkText cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateJob} className="space-y-4">
              {/* 3-Option Audience Visibility Selector */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-mutedText mb-1.5">
                  Who Can See & Apply For This Job?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, visibility: "PUBLIC", targetWorkerId: "" })
                    }
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      formData.visibility === "PUBLIC"
                        ? "border-govBlue-900 bg-govBlue-900/5"
                        : "border-borderLight bg-lightBg"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-govBlue-900">
                      <Globe className="w-3.5 h-3.5 text-saffron shrink-0" />
                      <span>All Users</span>
                    </div>
                    <p className="text-[10px] text-mutedText mt-0.5">
                      City-wide; open to any verified worker
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, visibility: "WARD_ONLY", targetWorkerId: "" })
                    }
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      formData.visibility === "WARD_ONLY"
                        ? "border-govBlue-900 bg-govBlue-900/5"
                        : "border-borderLight bg-lightBg"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-govBlue-900">
                      <Building2 className="w-3.5 h-3.5 text-govBlue-800 shrink-0" />
                      <span>Ward Only</span>
                    </div>
                    <p className="text-[10px] text-mutedText mt-0.5">
                      Only members of your ward/RWA
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, visibility: "DIRECT" })}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      formData.visibility === "DIRECT"
                        ? "border-saffron bg-saffron/10"
                        : "border-borderLight bg-lightBg"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-govBlue-900">
                      <UserCheck className="w-3.5 h-3.5 text-indiaGreen shrink-0" />
                      <span>Direct Friend</span>
                    </div>
                    <p className="text-[10px] text-mutedText mt-0.5">
                      Private offer to 1 trusted worker
                    </p>
                  </button>
                </div>
              </div>

              {/* Trusted Worker Dropdown (Shown only when DIRECT is chosen) */}
              {formData.visibility === "DIRECT" && (
                <div>
                  <label className="block text-xs font-mono font-bold text-govBlue-900 mb-1">
                    Select Trusted Worker (Friend) *
                  </label>
                  {trustedWorkers.length === 0 ? (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
                      You have no accepted trusted workers yet. Add a worker to your Trusted Circle from your hires or ward directory first.
                    </p>
                  ) : (
                    <select
                      required
                      value={formData.targetWorkerId}
                      onChange={(e) =>
                        setFormData({ ...formData, targetWorkerId: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-lightBg border border-borderLight text-xs font-medium"
                    >
                      <option value="">-- Choose a saved worker --</option>
                      {trustedWorkers
                        .filter(
                          (w) => w.userIntent === "WORKER" || w.userIntent === "BOTH"
                        )
                        .map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} ({w.ward}) {w.skills?.length ? `• ${w.skills.join(", ")}` : ""}
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              )}

              {/* Ward / Group Selector (Required only for WARD_ONLY; optional otherwise) */}
              {groups.length > 0 && (
                <div>
                  <label className="block text-xs font-mono font-bold text-mutedText mb-1">
                    Local Ward / Society {formData.visibility === "WARD_ONLY" ? "*" : "(Optional)"}
                  </label>
                  <select
                    required={formData.visibility === "WARD_ONLY"}
                    value={formData.groupId}
                    onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-lightBg border border-borderLight text-xs"
                  >
                    {formData.visibility !== "WARD_ONLY" && (
                      <option value="">-- All Wards / No Specific Society --</option>
                    )}
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.locality})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-mutedText mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-lightBg border border-borderLight text-xs"
                  >
                    {CATEGORIES.filter((c) => c !== "ALL").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-mutedText mb-1">
                    Direct Worker Payout (₹) *
                  </label>
                  <input
                    type="number"
                    min={50}
                    required
                    value={formData.hourlyCredits}
                    onChange={(e) =>
                      setFormData({ ...formData, hourlyCredits: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-lightBg border border-borderLight text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-mutedText mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ceiling fan regulator replacement & wiring check"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-lightBg border border-borderLight text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-mutedText mb-1">
                  Work Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe tools needed, preferred timing, and scope of work..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-lightBg border border-borderLight text-xs"
                />
              </div>

              {/* Two-Stage Location Inputs */}
              <div className="p-3.5 rounded-2xl bg-lightBg border border-borderLight space-y-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-govBlue-900 mb-1">
                    Stage 1: Public Rough Locality / Area *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gomti Nagar, Lucknow (Visible publicly)"
                    value={formData.roughLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, roughLocation: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-pureWhite border border-borderLight text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-indiaGreen mb-1">
                    Stage 2: Private Exact Address (Locked until worker hired) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. House 4/112, Vibhav Khand, Near Park"
                    value={formData.exactAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, exactAddress: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-pureWhite border border-borderLight text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  submitting ||
                  (formData.visibility === "DIRECT" && !formData.targetWorkerId)
                }
                className="w-full py-3 rounded-xl bg-saffron text-pureWhite text-xs font-bold hover:bg-saffron-dark transition disabled:opacity-50 cursor-pointer"
              >
                {submitting
                  ? "Publishing..."
                  : formData.visibility === "DIRECT"
                  ? "Send Private Direct Job Offer"
                  : formData.visibility === "WARD_ONLY"
                  ? "Post Job to Ward Only"
                  : "Post Job Open to All Users"}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center text-xs font-mono text-mutedText">
          Loading CivicSetu local jobs...
        </div>
      }
    >
      <ListingsContent />
    </Suspense>
  );
}