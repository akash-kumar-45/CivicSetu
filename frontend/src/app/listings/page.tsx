"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Layers, Plus, Clock, Search, Filter, AlertCircle, CheckCircle2, User, Sparkles } from "lucide-react";

export default function ListingsPage() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"ALL" | "OFFER" | "REQUEST">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState<any>(null);

  // Create Listing Form State
  const [newType, setNewType] = useState<"OFFER" | "REQUEST">("OFFER");
  const [newCategory, setNewCategory] = useState("Cleaning");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newHourlyCredits, setNewHourlyCredits] = useState(1);

  // Booking Request Form State
  const [bookingStartsAt, setBookingStartsAt] = useState("");
  const [bookingDuration, setBookingDuration] = useState(60);

  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const categories = [
    "Cleaning",
    "Cooking",
    "Tutoring",
    "Repairs",
    "Babysitting",
    "Gardening",
    "Elderly Care",
    "IT & Tech Support",
  ];

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
        if (data.groups?.length > 0) {
          const defaultGroup = data.groups.find((g: any) => g.userMembershipStatus === "ACTIVE") || data.groups[0];
          setSelectedGroupId(defaultGroup.id);
          loadListings(defaultGroup.id);
        } else {
          setLoading(false);
        }
      }
    } catch {
      setLoading(false);
    }
  };

  const loadListings = async (groupId: string) => {
    setLoading(true);
    setFeedbackError(null);
    try {
      const res = await fetch(`/api/listings?groupId=${groupId}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings || []);
      } else {
        const err = await res.json();
        setFeedbackError(err.error || "Must be an active member to view listings");
        setListings([]);
      }
    } catch {
      setFeedbackError("Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const gId = e.target.value;
    setSelectedGroupId(gId);
    loadListings(gId);
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);
    setFeedbackSuccess(null);

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: selectedGroupId,
          type: newType,
          category: newCategory,
          title: newTitle,
          description: newDescription,
          hourlyCredits: Number(newHourlyCredits),
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewTitle("");
        setNewDescription("");
        setNewHourlyCredits(1);
        setFeedbackSuccess("Listing published to cooperative catalog!");
        loadListings(selectedGroupId);
      } else {
        const data = await res.json();
        setFeedbackError(data.error || "Failed to create listing");
      }
    } catch {
      setFeedbackError("Failed to create listing");
    }
  };

  const handleRequestBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showBookingModal) return;

    setFeedbackError(null);
    setFeedbackSuccess(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: showBookingModal.id,
          startsAt: new Date(bookingStartsAt).toISOString(),
          durationMinutes: Number(bookingDuration),
        }),
      });

      if (res.ok) {
        setShowBookingModal(null);
        setFeedbackSuccess("Booking request sent! Check the Bookings tab to track status.");
      } else {
        const data = await res.json();
        setFeedbackError(data.error || "Failed to request booking");
      }
    } catch {
      setFeedbackError("Error sending booking request");
    }
  };

  // Filter listings
  const filteredListings = listings.filter((l) => {
    if (typeFilter !== "ALL" && l.type !== typeFilter) return false;
    if (categoryFilter !== "ALL" && l.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-midnight-950 text-pureWhite flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-neon/10 border border-lime-neon/40 text-lime-neon font-mono text-xs uppercase mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Time-Credit Service Catalog</span>
            </div>
            <h1 className="text-3xl font-black text-pureWhite">Service Listings</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Browse household services offered and requested in your cooperative group.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Group Selector */}
            {groups.length > 0 && (
              <select
                value={selectedGroupId}
                onChange={handleGroupChange}
                className="px-3 py-2.5 rounded-xl bg-midnight-900 border border-zinc-800 text-xs font-medium text-pureWhite focus:border-lime-neon focus:outline-none"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    Co-op: {g.name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setShowCreateModal(true)}
              className="py-2.5 px-4 rounded-xl bg-lime-neon text-midnight-950 font-bold hover:bg-lime-bright transition shadow-neon-sm flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Listing</span>
            </button>
          </div>
        </div>

        {/* Feedback alerts */}
        {feedbackError && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{feedbackError}</span>
          </div>
        )}
        {feedbackSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-lime-950/60 border border-lime-neon/40 text-lime-neon text-xs flex items-center gap-2 shadow-neon-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-lime-neon" />
            <span>{feedbackSuccess}</span>
          </div>
        )}

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl glass-panel border border-zinc-800 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTypeFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                typeFilter === "ALL"
                  ? "bg-lime-neon text-midnight-950 font-bold"
                  : "bg-midnight-900 text-zinc-400 hover:text-pureWhite"
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setTypeFilter("OFFER")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                typeFilter === "OFFER"
                  ? "bg-lime-neon text-midnight-950 font-bold"
                  : "bg-midnight-900 text-zinc-400 hover:text-pureWhite"
              }`}
            >
              OFFERS
            </button>
            <button
              onClick={() => setTypeFilter("REQUEST")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                typeFilter === "REQUEST"
                  ? "bg-lime-neon text-midnight-950 font-bold"
                  : "bg-midnight-900 text-zinc-400 hover:text-pureWhite"
              }`}
            >
              REQUESTS
            </button>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-midnight-900 border border-zinc-800 text-xs text-pureWhite focus:border-lime-neon focus:outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-midnight-900 border border-zinc-800 text-xs font-medium text-pureWhite focus:border-lime-neon focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-zinc-500">
            Querying listings within co-op group...
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="py-20 text-center rounded-3xl glass-panel border border-zinc-800">
            <Layers className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-pureWhite">No service listings found</h3>
            <p className="text-xs text-zinc-400 mt-1 mb-4">
              Be the first to offer or request household services in this group.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="py-2.5 px-4 rounded-xl bg-lime-neon text-midnight-950 font-bold text-xs"
            >
              Create Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl glass-panel-lime border border-lime-neon/20 p-6 flex flex-col justify-between hover:border-lime-neon/50 transition shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider ${
                        item.type === "OFFER"
                          ? "bg-lime-neon/20 text-lime-neon border border-lime-neon/40"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 uppercase">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-pureWhite mb-2">{item.title}</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3 mb-4">
                    {item.description}
                  </p>
                </div>

                <div>
                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <User className="w-3.5 h-3.5 text-lime-neon" />
                      <span>{item.owner?.name || "Member"}</span>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-sm font-bold text-lime-neon">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.hourlyCredits} C/hr</span>
                    </div>
                  </div>

                  {item.ownerId !== (session?.user as any)?.id ? (
                    <button
                      onClick={() => setShowBookingModal(item)}
                      className="w-full py-2.5 px-4 rounded-xl bg-lime-neon text-midnight-950 font-bold hover:bg-lime-bright transition text-xs shadow-neon-sm cursor-pointer"
                    >
                      {item.type === "OFFER" ? "Book This Service" : "Offer to Fulfill Request"}
                    </button>
                  ) : (
                    <div className="w-full py-2 rounded-xl bg-midnight-900 border border-zinc-800 text-center text-xs font-mono text-zinc-500">
                      Your Listing (Owner)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Create Listing */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md">
            <div className="w-full max-w-lg p-6 rounded-3xl glass-panel-lime border border-lime-neon/40 shadow-neon-md">
              <h3 className="text-xl font-bold text-pureWhite mb-1">Create Service Listing</h3>
              <p className="text-xs text-zinc-400 mb-4">
                List an OFFER (service you can provide) or REQUEST (service you need).
              </p>

              <form onSubmit={handleCreateListing} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 uppercase mb-1">Listing Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewType("OFFER")}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                        newType === "OFFER"
                          ? "bg-lime-neon text-midnight-950 border-lime-neon font-bold"
                          : "bg-midnight-900 text-zinc-400 border-zinc-800"
                      }`}
                    >
                      OFFER (I will provide)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewType("REQUEST")}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                        newType === "REQUEST"
                          ? "bg-blue-500 text-white border-blue-500 font-bold"
                          : "bg-midnight-900 text-zinc-400 border-zinc-800"
                      }`}
                    >
                      REQUEST (I need help)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 uppercase mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-midnight-900 border border-zinc-800 text-xs text-pureWhite focus:border-lime-neon focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Mathematics & Calculus Tutoring"
                    className="w-full px-3 py-2 rounded-lg bg-midnight-900 border border-zinc-800 text-xs text-pureWhite focus:border-lime-neon focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 uppercase mb-1">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Detailed explanation of the task or assistance needed..."
                    className="w-full px-3 py-2 rounded-lg bg-midnight-900 border border-zinc-800 text-xs text-pureWhite focus:border-lime-neon focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 uppercase mb-1">
                    Hourly Time Credits (Integer only)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={newHourlyCredits}
                    onChange={(e) => setNewHourlyCredits(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-lg bg-midnight-900 border border-zinc-800 text-xs text-pureWhite focus:border-lime-neon focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    1 Credit corresponds to 1 hour of labor. Integers only.
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 rounded-lg bg-midnight-900 border border-zinc-800 text-xs text-zinc-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-lg bg-lime-neon text-midnight-950 font-bold hover:bg-lime-bright text-xs shadow-neon-sm"
                  >
                    Publish Listing
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Request Booking */}
        {showBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md">
            <div className="w-full max-w-md p-6 rounded-3xl glass-panel-lime border border-lime-neon/40 shadow-neon-md">
              <h3 className="text-xl font-bold text-pureWhite mb-1">Schedule Booking</h3>
              <p className="text-xs text-zinc-400 mb-4">
                Service: <span className="text-lime-neon font-medium">{showBookingModal.title}</span> ({showBookingModal.hourlyCredits} Credits/hr)
              </p>

              <form onSubmit={handleRequestBooking} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 uppercase mb-1">
                    Service Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={bookingStartsAt}
                    onChange={(e) => setBookingStartsAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-midnight-900 border border-zinc-800 text-xs text-pureWhite focus:border-lime-neon focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 uppercase mb-1">
                    Duration in Minutes
                  </label>
                  <select
                    value={bookingDuration}
                    onChange={(e) => setBookingDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-midnight-900 border border-zinc-800 text-xs text-pureWhite focus:border-lime-neon focus:outline-none"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes (1 hour)</option>
                    <option value={90}>90 minutes (1.5 hours)</option>
                    <option value={120}>120 minutes (2 hours)</option>
                    <option value={180}>180 minutes (3 hours)</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-midnight-900 border border-zinc-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Total Credits Needed:</span>
                  <span className="font-bold text-lime-neon">
                    {Math.max(1, Math.round((bookingDuration / 60) * showBookingModal.hourlyCredits))} Credits
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(null)}
                    className="flex-1 py-2.5 rounded-lg bg-midnight-900 border border-zinc-800 text-xs text-zinc-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-lg bg-lime-neon text-midnight-950 font-bold hover:bg-lime-bright text-xs shadow-neon-sm"
                  >
                    Send Booking Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
