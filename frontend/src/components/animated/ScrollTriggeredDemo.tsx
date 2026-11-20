"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, ArrowRight, Shield, Star } from "lucide-react";

export function ScrollTriggeredDemo() {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      num: 1,
      title: "Service Offered",
      role: "Alice (Electrician)",
      desc: "Alice posts an OFFER listing in Maple Street Co-op: 'Ceiling Fan Repair at 1 credit/hour'.",
      action: "Listing created on ledger",
    },
    {
      num: 2,
      title: "Booking Requested",
      role: "Bob (Resident)",
      desc: "Bob needs repair at 10:00 AM. System creates booking in REQUESTED state for 1 credit.",
      action: "REQUESTED state logged",
    },
    {
      num: 3,
      title: "Provider Accepts",
      role: "Alice (Electrician)",
      desc: "Alice accepts the request. System verifies Alice has no overlapping bookings during this slot.",
      action: "ACCEPTED (overlap check passed)",
    },
    {
      num: 4,
      title: "Service Completed",
      role: "Alice (Electrician)",
      desc: "After service ends, Alice marks completed. Atomic $transaction verifies Bob's balance and transfers 1 credit to Alice.",
      action: "COMPLETED & LedgerEntry posted",
    },
    {
      num: 5,
      title: "Mutual Reviews",
      role: "Alice & Bob",
      desc: "Bob rates Alice 5 stars ('Great repair!'). Alice rates Bob 5 stars. Booking transitions to REVIEWED.",
      action: "REVIEWED (100% complete)",
    },
  ];

  return (
    <div className="relative py-20 px-4 max-w-4xl mx-auto bg-midnight-950">
      <div className="text-center mb-12">
        <span className="inline-block px-3 py-1 rounded-full bg-lime-neon/10 border border-lime-neon/40 text-lime-neon font-mono text-xs uppercase tracking-widest mb-3">
          Interactive Walkthrough
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-pureWhite tracking-tight">
          Scroll-Triggered <span className="text-lime-neon">Booking Lifecycle</span>
        </h2>
        <p className="text-sm text-zinc-400 mt-2">
          Step through the verified cooperative state machine from listing to atomic payment.
        </p>
      </div>

      {/* Stepper Navigator */}
      <div className="grid grid-cols-5 gap-2 mb-8">
        {steps.map((s) => (
          <button
            key={s.num}
            onClick={() => setCurrentStep(s.num)}
            className={`py-3 px-2 rounded-xl text-center border transition cursor-pointer ${
              currentStep === s.num
                ? "bg-lime-neon/20 border-lime-neon text-lime-neon shadow-neon-sm"
                : currentStep > s.num
                ? "bg-midnight-900/80 border-zinc-700 text-pureWhite"
                : "bg-midnight-900/30 border-zinc-800 text-zinc-500"
            }`}
          >
            <div className="text-xs font-mono font-bold">STEP {s.num}</div>
            <div className="text-[11px] hidden sm:block truncate mt-0.5">{s.title}</div>
          </button>
        ))}
      </div>

      {/* Step Detail Card */}
      <div className="p-8 rounded-3xl glass-panel-lime border border-lime-neon/40 shadow-neon-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-lime-neon text-midnight-950 font-bold font-mono text-xs">
                STATUS: {steps[currentStep - 1].title.toUpperCase()}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                Actor: {steps[currentStep - 1].role}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-pureWhite mt-2 mb-3">
              {steps[currentStep - 1].title}
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed max-w-xl">
              {steps[currentStep - 1].desc}
            </p>

            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-lime-neon">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{steps[currentStep - 1].action}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 min-w-[180px]">
            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep((c) => c + 1)}
                className="py-3 px-4 rounded-xl bg-lime-neon text-midnight-950 font-bold hover:bg-lime-bright transition flex items-center justify-center gap-2 text-xs shadow-neon-sm cursor-pointer"
              >
                <span>Trigger Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(1)}
                className="py-3 px-4 rounded-xl bg-midnight-900 border border-lime-neon/50 text-lime-neon font-bold hover:bg-lime-neon/10 transition flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <span>Replay Lifecycle Demo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
