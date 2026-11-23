"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  ShieldCheck,
  UserPlus,
  UserCheck,
  MapPin,
  Unlock,
  Lock,
  IndianRupee,
  BadgeCheck,
} from "lucide-react";

export default function BookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<"ALL" | "requester" | "provider">("ALL");

  // Track trusted circle connections & pending invites
  const [trustedIds, setTrustedIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [invitingWorkerId, setInvitingWorkerId] = useState<string | null>(null);

  // Review modal state
  const [reviewBookingModal, setReviewBookingModal] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
    if (session?.user) {
      loadTrustedCircle();
    }
  }, [session, filterRole]);

  const loadBookings = async () => {
    setLoading(true);
    setFeedbackError(null);
    try {
      const url = filterRole === "ALL" ? "/api/bookings" : `/api/bookings?role=${filterRole}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch {
      setFeedbackError("Failed to fetch work bookings");
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
    if (!workerId) return;
    setInvitingWorkerId(workerId);
    setFeedbackError(null);
    setFeedbackSuccess(null);

    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId }),
      });

      const data = await res.json();
      if (res.ok) {
        setPendingIds((prev) => new Set(prev).add(workerId));
        setFeedbackSuccess(
          `Trusted Circle invitation sent to ${workerName}. Once accepted, you can send them private direct job offers!`
        );
      } else {
        setFeedbackError(data.error || "Could not send trusted worker request");
      }
    } catch {
      setFeedbackError("Network error while sending trusted worker request");
    } finally {
      setInvitingWorkerId(null);
    }
  };

  const handleBookingAction = async (
    bookingId: string,
    action: "ACCEPT" | "DECLINE" | "CANCEL" | "COMPLETE"
  ) => {
    setFeedbackError(null);
    setFeedbackSuccess(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbackSuccess(
          action === "ACCEPT"
            ? "Worker hired! Exact address is now unlocked for this job."
            : action === "COMPLETE"
            ? "Work marked completed! Settle ₹0-fee payout directly via UPI or cash."
            : `Job status updated to ${action.toLowerCase()}ed.`
        );
        loadBookings();
      } else {
        setFeedbackError(data.error || `Failed to ${action.toLowerCase()} booking`);
      }
    } catch {
      setFeedbackError("Network error while updating job status");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBookingModal) return;

    setFeedbackError(null);
    setFeedbackSuccess(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: reviewBookingModal.id,
          rating: Number(rating),
          comment: comment.trim() || undefined,
        }),
      });

      if (res.ok) {
        setReviewBookingModal(null);
        setComment("");
        setRating(5);
        setFeedbackSuccess("Mutual rating published to verified civic profile!");
        loadBookings();
      } else {
        const data = await res.json();
        setFeedbackError(data.error || "Failed to submit review");
      }
    } catch {
      setFeedbackError("Error submitting review");
    }
  };

  const userId = (session?.user as any)?.id;

  return (
    <div className="min-h-screen bg-pureWhite text-darkText flex flex-col pt-16">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-borderLight">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron/10 border border-saffron/40 text-saffron font-mono text-xs uppercase mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Civic Work & Direct Settlement Tracker</span>
            </div>
            <h1 className="text-3xl font-black text-govBlue-900">My Hires & Work</h1>
            <p className="text-xs text-mutedText mt-1">
              Manage applications, unlock exact addresses upon selection, and add reliable workers to your Trusted Circle.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterRole("ALL")}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono transition ${
                filterRole === "ALL"
                  ? "bg-saffron text-pureWhite font-bold"
                  : "bg-lightBg text-mutedText hover:text-darkText"
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilterRole("provider")}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono transition ${
                filterRole === "provider"
                  ? "bg-saffron text-pureWhite font-bold"
                  : "bg-lightBg text-mutedText hover:text-darkText"
              }`}
            >
              MY WORK (WORKER)
            </button>
            <button
              onClick={() => setFilterRole("requester")}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono transition ${
                filterRole === "requester"
                  ? "bg-saffron text-pureWhite font-bold"
                  : "bg-lightBg text-mutedText hover:text-darkText"
              }`}
            >
              MY HIRES (OWNER)
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {feedbackError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{feedbackError}</span>
          </div>
        )}
        {feedbackSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-indiaGreen text-xs font-semibold flex items-center gap-2 shadow-gov-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-indiaGreen" />
            <span>{feedbackSuccess}</span>
          </div>
        )}

        {/* Bookings List */}
        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-mutedText">
            Loading civic work records...
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-20 text-center rounded-3xl gov-panel border border-borderLight">
            <Clock className="w-10 h-10 text-mutedText mx-auto mb-3" />
            <h3 className="text-lg font-bold text-govBlue-900">No hires or work applications yet</h3>
            <p className="text-xs text-mutedText mt-1">
              Post a local task or apply to open ward jobs to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const isProvider = b.providerId === userId;
              const isRequester = b.requesterId === userId;
              const isJobOwner = (b.listing?.ownerId || b.requesterId) === userId;
              const startsAtDate = new Date(b.startsAt);
              const hasStartsAtPassed = new Date() >= startsAtDate;

              const counterparty = isProvider ? b.requester : b.provider;
              const counterpartyId = counterparty?.id;
              const isAlreadyTrusted = counterpartyId && trustedIds.has(counterpartyId);
              const isInvitePending = counterpartyId && pendingIds.has(counterpartyId);

              const isAddressUnlocked = ["ACCEPTED", "COMPLETED", "REVIEWED"].includes(b.status);

              return (
                <div
                  key={b.id}
                  className="rounded-2xl gov-panel-blue border border-govBlue-800/20 p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-govBlue-800/40 transition"
                >
                  <div className="flex-1 space-y-2.5">
                    {/* Status & Role Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider ${
                          b.status === "REQUESTED"
                            ? "bg-amber-500/20 text-amber-600 border border-amber-500/40"
                            : b.status === "ACCEPTED"
                            ? "bg-indiaGreen/20 text-indiaGreen border border-indiaGreen/40"
                            : b.status === "COMPLETED"
                            ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/40"
                            : b.status === "REVIEWED"
                            ? "bg-purple-500/20 text-purple-600 border border-purple-500/40"
                            : "bg-red-500/20 text-red-600 border border-red-500/40"
                        }`}
                      >
                        {b.status}
                      </span>

                      <span className="text-[11px] font-mono text-mutedText">
                        {isProvider ? "Role: WORKER" : "Role: CITIZEN OWNER"}
                      </span>
                    </div>

                    {/* Job Title */}
                    <h3 className="text-lg font-bold text-govBlue-900">
                      {b.listing?.title || "Local Civic Service"}
                    </h3>

                    {/* Schedule, Direct Payout & Counterparty + Add to Trusted Circle */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-mutedText">
                      <span>Schedule: {startsAtDate.toLocaleString()}</span>
                      <span className="inline-flex items-center text-indiaGreen font-bold">
                        Direct Payout: <IndianRupee className="w-3.5 h-3.5 ml-0.5" />
                        {b.creditAmount} (₹0 Fee)
                      </span>

                      <div className="inline-flex flex-wrap items-center gap-2">
                        <span className="text-darkText font-semibold inline-flex items-center gap-1">
                          {isProvider ? "Citizen:" : "Worker:"} {counterparty?.name || "Verified Member"}
                          <BadgeCheck className="w-3.5 h-3.5 text-indiaGreen" />
                        </span>

                        {/* Add to Trusted Circle Button */}
                        {counterpartyId && counterpartyId !== userId && (
                          isAlreadyTrusted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-indiaGreen text-[11px] font-bold">
                              <UserCheck className="w-3 h-3" />
                              <span>In Trusted Circle</span>
                            </span>
                          ) : isInvitePending ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold">
                              <Clock className="w-3 h-3" />
                              <span>Trusted Invite Pending</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={invitingWorkerId === counterpartyId}
                              onClick={() =>
                                handleAddToTrustedCircle(
                                  counterpartyId,
                                  counterparty?.name || "Worker"
                                )
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-indiaGreen text-[11px] font-bold hover:bg-emerald-100 transition cursor-pointer disabled:opacity-50"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>
                                {invitingWorkerId === counterpartyId
                                  ? "Sending..."
                                  : "Add to Trusted Circle"}
                              </span>
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Two-Stage Location Privacy Indicator */}
                    <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-mono">
                      <span className="inline-flex items-center gap-1 text-bodyText">
                        <MapPin className="w-3.5 h-3.5 text-saffron" />
                        Ward: {b.listing?.roughLocation || "Local Ward"}
                      </span>

                      {isAddressUnlocked && b.listing?.exactAddress ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-indiaGreen font-semibold">
                          <Unlock className="w-3 h-3" />
                          Exact Address: {b.listing.exactAddress}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-mutedText">
                          <Lock className="w-3 h-3" />
                          Exact address unlocks upon acceptance
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Guarded by State Machine & Roles */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status: REQUESTED */}
                    {/* Status: REQUESTED */}
                    {b.status === "REQUESTED" && (
                      <>
                        {isJobOwner ? (
                          <>
                            <button
                              onClick={() => handleBookingAction(b.id, "ACCEPT")}
                              className="py-2 px-3.5 rounded-xl bg-saffron text-pureWhite font-bold text-xs hover:bg-saffron-dark transition cursor-pointer"
                            >
                              Hire Worker & Unlock Address
                            </button>
                            <button
                              onClick={() => handleBookingAction(b.id, "DECLINE")}
                              className="py-2 px-3.5 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold text-xs hover:bg-red-100 transition cursor-pointer"
                            >
                              Decline
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-mono font-semibold">
                              Awaiting Owner Approval
                            </span>
                            <button
                              onClick={() => handleBookingAction(b.id, "CANCEL")}
                              className="py-2 px-3 rounded-xl bg-lightBg border border-borderLight text-mutedText text-xs hover:text-red-500 transition cursor-pointer"
                            >
                              Withdraw
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {/* Status: ACCEPTED */}
                    {b.status === "ACCEPTED" && (
                      <>
                        {isProvider && (
                          <button
                            onClick={() => handleBookingAction(b.id, "COMPLETE")}
                            title={
                              !hasStartsAtPassed
                                ? "Can only complete after scheduled start time"
                                : ""
                            }
                            className="py-2 px-3.5 rounded-xl bg-saffron text-pureWhite font-bold text-xs hover:bg-saffron-dark transition cursor-pointer shadow-saffron-sm"
                          >
                            Mark Completed & Settle ₹{b.creditAmount}
                          </button>
                        )}
                        {(isProvider || isRequester) && (
                          <button
                            onClick={() => handleBookingAction(b.id, "CANCEL")}
                            className="py-2 px-3.5 rounded-xl bg-lightBg border border-borderLight text-mutedText text-xs hover:text-red-500 transition cursor-pointer"
                          >
                            Cancel Job
                          </button>
                        )}
                      </>
                    )}

                    {/* Status: COMPLETED or REVIEWED */}
                    {(b.status === "COMPLETED" || b.status === "REVIEWED") && (
                      <>
                        {b.status === "COMPLETED" && (
                          <button
                            onClick={() => setReviewBookingModal(b)}
                            className="py-2 px-3.5 rounded-xl bg-pureWhite border border-govBlue-800 text-govBlue-800 font-bold text-xs hover:bg-govBlue-800/10 transition cursor-pointer"
                          >
                            Rate & Review
                          </button>
                        )}
                        <div className="flex items-center gap-1 text-xs text-indiaGreen font-mono font-semibold">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Direct Settlement Recorded</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Submit Review */}
        {reviewBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-govBlue-950/60 backdrop-blur-md">
            <div className="w-full max-w-md p-6 rounded-3xl gov-panel-saffron border border-saffron/40 shadow-gov-md">
              <h3 className="text-xl font-bold text-govBlue-900 mb-1">Rate Verified Partner</h3>
              <p className="text-xs text-mutedText mb-4">
                Job: <span className="text-saffron font-semibold">{reviewBookingModal.listing?.title}</span>
              </p>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-bodyText uppercase mb-2">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 cursor-pointer focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-borderMedium hover:text-mutedText"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono text-saffron font-bold ml-2">
                      {rating} / 5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-bodyText uppercase mb-1">
                    Review Comment (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share feedback on punctuality, quality of work, and direct settlement..."
                    className="w-full px-3 py-2 rounded-lg bg-lightBg border border-borderLight text-xs text-darkText focus:border-govBlue-800 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewBookingModal(null)}
                    className="flex-1 py-2.5 rounded-lg bg-lightBg border border-borderLight text-xs text-mutedText"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-lg bg-saffron text-pureWhite font-bold hover:bg-saffron-dark text-xs shadow-gov-sm cursor-pointer"
                  >
                    Submit Review
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