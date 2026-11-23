"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCheck,
  UserPlus,
  BadgeCheck,
  MapPin,
  Check,
  X,
  Send,
  Shield,
} from "lucide-react";

export function TrustedCirclePanel() {
  const [trustedWorkers, setTrustedWorkers] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadConnections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/friends");
      if (res.ok) {
        const data = await res.json();
        setTrustedWorkers(data.trustedWorkers || []);
        setIncomingRequests(data.incomingRequests || []);
      }
    } catch (err) {
      console.error("Failed to load trusted circle", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const handleRespond = async (connectionId: string, status: "ACCEPTED" | "DECLINED") => {
    setActionLoadingId(connectionId);
    try {
      const res = await fetch("/api/friends", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, status }),
      });
      if (res.ok) {
        await loadConnections();
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="rounded-3xl gov-panel border border-borderLight p-6 sm:p-8 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-govBlue-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indiaGreen" />
            <span>Trusted Workers & Direct Offer Circle</span>
          </h2>
          <p className="text-xs text-mutedText mt-1">
            Add reliable neighbors as trusted workers to send private direct job offers without broadcasting publicly.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-indiaGreen font-mono text-xs font-bold">
          {trustedWorkers.length} Trusted Worker{trustedWorkers.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Incoming Friend / Trusted Worker Requests (For Workers) */}
      {incomingRequests.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-saffron/10 border border-saffron/40">
          <h3 className="text-xs font-mono font-bold uppercase text-saffron mb-3 flex items-center gap-1.5">
            <UserPlus className="w-4 h-4" />
            <span>Incoming Trusted Worker Invitations ({incomingRequests.length})</span>
          </h3>
          <div className="space-y-2.5">
            {incomingRequests.map((req) => (
              <div
                key={req.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-pureWhite border border-borderLight"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-darkText">{req.owner?.name}</span>
                    {req.owner?.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indiaGreen font-semibold">
                        <BadgeCheck className="w-3.5 h-3.5" /> Gov-ID Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-mutedText flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {req.owner?.ward || "Local Ward"} • Wants to add you for direct job offers
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={actionLoadingId === req.id}
                    onClick={() => handleRespond(req.id, "ACCEPTED")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indiaGreen text-pureWhite text-xs font-bold hover:opacity-90 transition disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept
                  </button>
                  <button
                    disabled={actionLoadingId === req.id}
                    onClick={() => handleRespond(req.id, "DECLINED")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-lightBg border border-borderLight text-mutedText text-xs font-semibold hover:text-red-500 transition disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accepted Trusted Workers List (For Owners) */}
      {loading ? (
        <div className="py-6 text-center text-xs font-mono text-mutedText">
          Loading trusted circle...
        </div>
      ) : trustedWorkers.length === 0 ? (
        <div className="py-8 text-center rounded-2xl bg-lightBg/60 border border-dashed border-borderLight">
          <Shield className="w-7 h-7 text-mutedText mx-auto mb-2" />
          <p className="text-sm font-semibold text-darkText">No saved workers in your Trusted Circle yet</p>
          <p className="text-xs text-mutedText mt-1">
            After hiring a worker on a job or viewing your ward directory, click &ldquo;Add to Trusted Circle&rdquo; to offer them future jobs directly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trustedWorkers.map((worker) => (
            <div
              key={worker.connectionId}
              className="p-4 rounded-2xl bg-pureWhite border border-borderLight hover:border-govBlue-800/40 transition flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-govBlue-900">{worker.name}</h4>
                    <p className="text-[11px] font-mono text-mutedText flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-saffron" />
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
                    {worker.skills.slice(0, 4).map((skill: string) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md bg-lightBg border border-borderLight text-[11px] text-bodyText"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href={`/listings?directWorkerId=${worker.id}`}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-govBlue-900 text-pureWhite text-xs font-bold hover:bg-govBlue-800 transition"
              >
                <Send className="w-3.5 h-3.5 text-saffron" />
                <span>Offer Job Directly</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}