"use client";

import React, { useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";

export function ScrollTriggeredDemo() {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      num: 1,
      title: "Job Posted (Rough Area)",
      role: "Priya (Task Owner • ID Verified)",
      desc: "Priya posts 'Ceiling Fan Repair & Wiring Check' (Est. ₹500) showing only her rough ward/locality—keeping her exact home address private.",
      action: "Posted with rough locality • Exact address hidden",
    },
    {
      num: 2,
      title: "Verified Workers Apply",
      role: "Rohan (Local Electrician • ID Verified)",
      desc: "Rohan views Priya's verified owner rating and applies. Our smart ranking sorts applicants by ward proximity, skill match, and past ratings.",
      action: "Smart-matched by proximity & skill score",
    },
    {
      num: 3,
      title: "Select & Unlock Address",
      role: "Priya & Rohan",
      desc: "Priya reviews Rohan's public profile and selects him. The exact house address unlocks, and Rohan checks Priya's safety rating before traveling.",
      action: "Mutual trust confirmed • Exact location shared",
    },
    {
      num: 4,
      title: "Work Done & Direct Pay",
      role: "Rohan & Priya",
      desc: "Rohan completes the repair on site. Priya pays ₹500 directly via UPI or cash (₹0 platform fee), and both mark the job complete.",
      action: "100% direct settlement • Dual completion logged",
    },
    {
      num: 5,
      title: "Two-Way Trust Rating",
      role: "Priya & Rohan",
      desc: "Priya rates Rohan's work quality, and Rohan rates Priya's safety and fair payment—strengthening public trust records for the entire ward.",
      action: "Mutual civic ratings updated on public profile",
    },
  ];

  return (
    <div className="relative py-20 px-4 max-w-4xl mx-auto bg-pureWhite">
      <div className="text-center mb-12">
        <span className="inline-block px-3 py-1 rounded-full bg-saffron/10 border border-saffron/40 text-saffron font-mono text-xs uppercase tracking-widest mb-3">
          How It Works
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-govBlue-900 tracking-tight">
          Step-by-Step <span className="text-saffron">Direct Hiring Flow</span>
        </h2>
        <p className="text-sm text-mutedText mt-2">
          See how ID-verified citizens and local workers connect safely from rough-area posting to direct payment.
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
                ? "bg-saffron/20 border-saffron text-saffron shadow-saffron-sm"
                : currentStep > s.num
                ? "bg-lightBg border-borderMedium text-darkText"
                : "bg-lightBg/30 border-borderLight text-mutedText"
            }`}
          >
            <div className="text-xs font-mono font-bold">STEP {s.num}</div>
            <div className="text-[11px] hidden sm:block truncate mt-0.5">{s.title}</div>
          </button>
        ))}
      </div>

      {/* Step Detail Card */}
      <div className="p-8 rounded-3xl gov-panel-saffron border border-saffron/40 shadow-saffron-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-saffron text-pureWhite font-bold font-mono text-xs">
                STEP {steps[currentStep - 1].num}: {steps[currentStep - 1].title.toUpperCase()}
              </span>
              <span className="text-xs font-mono text-mutedText">
                Active Role: {steps[currentStep - 1].role}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-govBlue-900 mt-2 mb-3">
              {steps[currentStep - 1].title}
            </h3>
            <p className="text-sm text-bodyText leading-relaxed max-w-xl">
              {steps[currentStep - 1].desc}
            </p>

            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-indiaGreen">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{steps[currentStep - 1].action}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 min-w-[180px]">
            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep((c) => c + 1)}
                className="py-3 px-4 rounded-xl bg-saffron text-pureWhite font-bold hover:bg-saffron-dark transition flex items-center justify-center gap-2 text-xs shadow-saffron-sm cursor-pointer"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(1)}
                className="py-3 px-4 rounded-xl bg-pureWhite border border-saffron/50 text-saffron font-bold hover:bg-saffron/10 transition flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <span>Replay Walkthrough</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}