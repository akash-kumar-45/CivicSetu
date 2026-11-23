"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import {
  UserCheck,
  UserPlus,
  BadgeCheck,
  MapPin,
  Check,
  X,
  Send,
  Clock,
  Trash2,
  Bell,
  Users,
  AlertCircle,
} from "lucide-react";

export default function FriendsPage() {
  const { data: session } = useSession();
  const [trustedWorkers, setTrustedWorkers] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (session?.user) {
      loadAllConnections();
    }
  }, [session]);

  const loadAllConnections = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/friends", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setTrustedWorkers(data.trustedWorkers || data.friends || []);
        setIncomingRequests(data.incomingRequests || []);
        setOutgoingRequests(data.outgoingRequests || []);
      } else {
        setErrorMsg(data.error || "Failed to load Trusted Circle");
      }
    } catch (err) {
      console.error("Failed to fetch trusted circle", err);
      setErrorMsg("Network error while loading Trusted Circle");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (connectionId: string, status: "ACCEPTED" | "DECLINED") => {
    setActionLoadingId(connectionId);
    setToastMsg("");
    setErrorMsg("");
    try {
      const res = await fetch("/api/friends", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, status }),
      });
      const data = await res.json();
      if (res.ok) {
        setToastMsg(
          status === "ACCEPTED"
            ? "Request accepted! You are now connected in the Trusted Circle."
            : "Invitation declined."
        );
        await loadAllConnections();
      } else {
        setErrorMsg(data.error || "Failed to update request");
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemove = async (connectionId: string, name: string) => {
    setActionLoadingId(connectionId);
    setToastMsg("");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/friends?connectionId=${connectionId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setToastMsg(`Removed ${name} from your Trusted Circle.`);
        await loadAllConnections();
      } else {
        setErrorMsg(data.error || "Failed to remove connection");
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-pureWhite text-darkText flex flex-col pt-16">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-borderLight">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron/10 border border-saffron/40 text-saffron font-mono text-xs font-bold mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Trusted Circle & Friend Invitations</span>
            </div>
            <h1 className="text-3xl font-black text-govBlue-900">
              My Trusted Circle & Notifications
            </h1>
            <p className="text-xs text-mutedText mt-1">
              Accept incoming friend requests, manage your saved trusted workers, and send private direct job offers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-indiaGreen font-mono text-xs font-bold">
              {trustedWorkers.length} Connected
            </span>
            {incomingRequests.length > 0 && (
              <span className="px-3.5 py-2 rounded-xl bg-saffron text-pureWhite font-mono text-xs font-bold flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" />
                {incomingRequests.length} New Request{incomingRequests.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </span>
            <button onClick={() => setErrorMsg("")} className="underline ml-4">
              Dismiss
            </button>
          </div>
        )}

        {toastMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-indiaGreen text-xs font-semibold flex items-center justify-between">
            <span>{toastMsg}</span>
            <button onClick={() => setToastMsg("")} className="underline ml-4">
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-mutedText">
            Loading notifications and trusted circle...
          </div>
        ) : (
          <div className="space-y-10">
            {/* Section 1: Incoming Notifications / Friend Requests */}
            <section className="rounded-3xl p-6 border border-saffron/40 bg-saffron/5">
              <h2 className="text-lg font-bold text-govBlue-900 flex items-center gap-2 mb-1">
                <Bell className="w-5 h-5 text-saffron" />
                <span>Incoming Friend & Trusted Worker Requests ({incomingRequests.length})</span>
              </h2>
              <p className="text-xs text-mutedText mb-4">
                Citizens who want to add you to their Trusted Circle to send you private direct job offers.
              </p>

              {incomingRequests.length === 0 ? (
                <div className="p-6 rounded-2xl bg-pureWhite border border-borderLight text-center text-xs text-mutedText font-mono">
                  No pending incoming friend requests right now.
                </div>
              ) : (
                <div className="space-y-3">
                  {incomingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-pureWhite border border-borderLight shadow-gov-sm"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-govBlue-900">
                            {req.owner?.name}
                          </span>
                          {req.owner?.isVerified && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indiaGreen font-semibold">
                              <BadgeCheck className="w-3.5 h-3.5" /> Gov-ID Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-mutedText flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-saffron" />
                          {req.owner?.ward || "Local Ward"} • Wants to connect with you for direct job offers
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          disabled={actionLoadingId === req.id}
                          onClick={() => handleRespond(req.id, "ACCEPTED")}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indiaGreen text-pureWhite text-xs font-bold hover:opacity-90 transition cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" /> Accept Request
                        </button>
                        <button
                          disabled={actionLoadingId === req.id}
                          onClick={() => handleRespond(req.id, "DECLINED")}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lightBg border border-borderLight text-mutedText text-xs font-semibold hover:text-red-500 transition cursor-pointer disabled:opacity-50"
                        >
                          <X className="w-4 h-4" /> Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Section 2: All Connected Friends / Trusted Workers */}
            <section>
              <h2 className="text-lg font-bold text-govBlue-900 flex items-center gap-2 mb-1">
                <UserCheck className="w-5 h-5 text-indiaGreen" />
                <span>All Connected Friends & Trusted Workers ({trustedWorkers.length})</span>
              </h2>
              <p className="text-xs text-mutedText mb-4">
                Your verified trusted circle. Click &ldquo;Offer Job Directly&rdquo; to send a private job without posting publicly.
              </p>

              {trustedWorkers.length === 0 ? (
                <div className="p-10 rounded-3xl gov-panel border border-borderLight text-center">
                  <UserPlus className="w-8 h-8 text-mutedText mx-auto mb-2" />
                  <p className="text-sm font-bold text-darkText">Your Trusted Circle is empty</p>
                  <p className="text-xs text-mutedText mt-1 mb-4">
                    Visit Local Wards or My Hires & Work and click &ldquo;Add to Trusted Circle&rdquo; next to any verified neighbor.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Link
                      href="/groups"
                      className="px-4 py-2 rounded-xl bg-govBlue-900 text-pureWhite text-xs font-bold"
                    >
                      Browse Local Wards
                    </Link>
                    <Link
                      href="/bookings"
                      className="px-4 py-2 rounded-xl bg-lightBg border border-borderLight text-darkText text-xs font-bold"
                    >
                      View Past Hires
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {trustedWorkers.map((worker) => (
                    <div
                      key={worker.connectionId || worker.id}
                      className="p-5 rounded-2xl gov-panel-blue border border-govBlue-800/20 flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-base font-bold text-govBlue-900">{worker.name}</h3>
                            <p className="text-xs font-mono text-mutedText flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-saffron" />
                              {worker.ward}
                            </p>
                          </div>
                          {worker.isVerified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-indiaGreen text-[10px] font-mono font-bold">
                              <BadgeCheck className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>

                        {worker.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {worker.skills.map((skill: string) => (
                              <span
                                key={skill}
                                className="px-2 py-0.5 rounded-md bg-pureWhite border border-borderLight text-[11px] text-bodyText"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-borderLight">
                        {worker.userIntent === "WORKER" || worker.userIntent === "BOTH" ? (
                          <Link
                            href={`/listings?directWorkerId=${worker.id}`}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-govBlue-900 text-pureWhite text-xs font-bold hover:bg-govBlue-800 transition"
                          >
                            <Send className="w-3.5 h-3.5 text-saffron" />
                            <span>Offer Job Directly</span>
                          </Link>
                        ) : (
                          <span className="flex-1 text-center py-2 px-3 rounded-xl bg-lightBg border border-borderLight text-[11px] font-mono text-mutedText">
                            Citizen Profile (Not a Worker)
                          </span>
                        )}
                        <button
                          disabled={actionLoadingId === worker.connectionId}
                          onClick={() => handleRemove(worker.connectionId, worker.name)}
                          title="Remove from Trusted Circle"
                          className="p-2 rounded-xl bg-lightBg border border-borderLight text-mutedText hover:text-red-500 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Section 3: Sent Requests Awaiting Acceptance */}
            {outgoingRequests.length > 0 && (
              <section>
                <h2 className="text-sm font-mono font-bold uppercase text-mutedText flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Sent Invitations Awaiting Approval ({outgoingRequests.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {outgoingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-2xl bg-lightBg border border-borderLight flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-xs font-bold text-darkText">{req.worker?.name}</p>
                        <p className="text-[11px] font-mono text-mutedText">
                          {req.worker?.ward || "Local Ward"}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-mono font-bold">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}