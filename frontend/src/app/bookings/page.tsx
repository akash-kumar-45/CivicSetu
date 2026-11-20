"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Clock, CheckCircle2, XCircle, AlertCircle, Star, MessageSquare, ArrowRight, ShieldCheck } from "lucide-react";

export default function BookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<"ALL" | "requester" | "provider">("ALL");

  // Review modal state
  const [reviewBookingModal, setReviewBookingModal] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
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
      setFeedbackError("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, action: "ACCEPT" | "DECLINE" | "CANCEL" | "COMPLETE") => {
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
        setFeedbackSuccess(`Booking successfully updated to ${action.toLowerCase()}ed.`);
        loadBookings();
      } else {
        setFeedbackError(data.error || `Failed to ${action.toLowerCase()} booking`);
      }
    } catch {
      setFeedbackError("Network error while performing booking action");
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
        setFeedbackSuccess("Review submitted! Rating published to member profile.");
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
    <div className="min-h-screen bg-midnight-950 text-pureWhite flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-neon/10 border border-lime-neon/40 text-lime-neon font-mono text-xs uppercase mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>State Machine Bookings</span>
            </div>
            <h1 className="text-3xl font-black text-pureWhite">Booking Tracker</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Deterministic state transitions: requested → accepted → completed → reviewed.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterRole("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                filterRole === "ALL"
                  ? "bg-lime-neon text-midnight-950 font-bold"
                  : "bg-midnight-900 text-zinc-400 hover:text-pureWhite"
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilterRole("provider")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                filterRole === "provider"
                  ? "bg-lime-neon text-midnight-950 font-bold"
                  : "bg-midnight-900 text-zinc-400 hover:text-pureWhite"
              }`}
            >
              AS PROVIDER
            </button>
            <button
              onClick={() => setFilterRole("requester")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                filterRole === "requester"
                  ? "bg-lime-neon text-midnight-950 font-bold"
                  : "bg-midnight-900 text-zinc-400 hover:text-pureWhite"
              }`}
            >
              AS REQUESTER
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
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

        {/* Bookings List */}
        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-zinc-500">
            Loading state-machine bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-20 text-center rounded-3xl glass-panel border border-zinc-800">
            <Clock className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-pureWhite">No bookings yet</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Browse the catalog to request or offer household services.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const isProvider = b.providerId === userId;
              const isRequester = b.requesterId === userId;
              const startsAtDate = new Date(b.startsAt);
              const hasStartsAtPassed = new Date() >= startsAtDate;

              return (
                <div
                  key={b.id}
                  className="rounded-2xl glass-panel-lime border border-lime-neon/20 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-lime-neon/40 transition"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider ${
                          b.status === "REQUESTED"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                            : b.status === "ACCEPTED"
                            ? "bg-lime-neon/20 text-lime-neon border border-lime-neon/40"
                            : b.status === "COMPLETED"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : b.status === "REVIEWED"
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                            : "bg-red-500/20 text-red-400 border border-red-500/40"
                        }`}
                      >
                        {b.status}
                      </span>

                      <span className="text-[11px] font-mono text-zinc-400">
                        {isProvider ? "You are PROVIDER" : "You are REQUESTER"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-pureWhite mb-1">
                      {b.listing?.title || "Community Service"}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
                      <span>Schedule: {startsAtDate.toLocaleString()}</span>
                      <span>Duration: {b.durationMinutes} min</span>
                      <span className="text-lime-neon font-bold">Cost: {b.creditAmount} Credits</span>
                      <span>
                        Counterparty: {isProvider ? b.requester?.name : b.provider?.name}
                      </span>
                    </div>
                  </div>

                  {/* Actions Guarded by State Machine & Roles */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status: REQUESTED */}
                    {b.status === "REQUESTED" && (
                      <>
                        {isProvider && (
                          <>
                            <button
                              onClick={() => handleBookingAction(b.id, "ACCEPT")}
                              className="py-2 px-3.5 rounded-xl bg-lime-neon text-midnight-950 font-bold text-xs hover:bg-lime-bright transition cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleBookingAction(b.id, "DECLINE")}
                              className="py-2 px-3.5 rounded-xl bg-red-950 text-red-200 border border-red-500/40 font-bold text-xs hover:bg-red-900 transition cursor-pointer"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {isRequester && (
                          <button
                            onClick={() => handleBookingAction(b.id, "CANCEL")}
                            className="py-2 px-3.5 rounded-xl bg-midnight-900 border border-zinc-700 text-zinc-300 text-xs hover:text-red-400 transition cursor-pointer"
                          >
                            Cancel Request
                          </button>
                        )}
                      </>
                    )}

                    {/* Status: ACCEPTED */}
                    {b.status === "ACCEPTED" && (
                      <>
                        {isProvider && (
                          <button
                            onClick={() => handleBookingAction(b.id, "COMPLETE")}
                            title={!hasStartsAtPassed ? "Can only complete after startsAt has passed" : ""}
                            className="py-2 px-3.5 rounded-xl bg-lime-neon text-midnight-950 font-bold text-xs hover:bg-lime-bright transition cursor-pointer shadow-neon-sm"
                          >
                            Mark Completed & Pay
                          </button>
                        )}
                        {(isProvider || isRequester) && (
                          <button
                            onClick={() => handleBookingAction(b.id, "CANCEL")}
                            className="py-2 px-3.5 rounded-xl bg-midnight-900 border border-zinc-700 text-zinc-400 text-xs hover:text-red-400 transition cursor-pointer"
                          >
                            Cancel Booking
                          </button>
                        )}
                      </>
                    )}

                    {/* Status: COMPLETED */}
                    {(b.status === "COMPLETED" || b.status === "REVIEWED") && (
                      <>
                        {b.status === "COMPLETED" && (
                          <button
                            onClick={() => setReviewBookingModal(b)}
                            className="py-2 px-3.5 rounded-xl bg-midnight-900 border border-lime-neon text-lime-neon font-bold text-xs hover:bg-lime-neon/10 transition cursor-pointer"
                          >
                            Rate & Review
                          </button>
                        )}
                        <div className="flex items-center gap-1 text-xs text-lime-neon font-mono">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Ledger Entry Settled</span>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md">
            <div className="w-full max-w-md p-6 rounded-3xl glass-panel-lime border border-lime-neon/40 shadow-neon-md">
              <h3 className="text-xl font-bold text-pureWhite mb-1">Rate Booking Partner</h3>
              <p className="text-xs text-zinc-400 mb-4">
                Service: <span className="text-lime-neon">{reviewBookingModal.listing?.title}</span>
              </p>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 uppercase mb-2">
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
                              : "text-zinc-700 hover:text-zinc-500"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono text-lime-neon font-bold ml-2">
                      {rating} / 5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 uppercase mb-1">
                    Review Comment (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe how the service exchange went..."
                    className="w-full px-3 py-2 rounded-lg bg-midnight-900 border border-zinc-800 text-xs text-pureWhite focus:border-lime-neon focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewBookingModal(null)}
                    className="flex-1 py-2.5 rounded-lg bg-midnight-900 border border-zinc-800 text-xs text-zinc-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-lg bg-lime-neon text-midnight-950 font-bold hover:bg-lime-bright text-xs shadow-neon-sm cursor-pointer"
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
