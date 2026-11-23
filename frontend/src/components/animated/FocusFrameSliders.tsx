"use client";

import React, { useState } from "react";
import { DollarSign, ShieldAlert, ShieldCheck } from "lucide-react";

export function FocusFrameSliders() {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="relative py-20 px-4 max-w-4xl mx-auto bg-pureWhite">
      <div className="text-center mb-12">
        <span className="inline-block px-3 py-1 rounded-full bg-saffron/10 border border-saffron/40 text-saffron font-mono text-xs uppercase tracking-widest mb-3">
          Interactive Comparison
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-govBlue-900 tracking-tight">
          Why Switch: <span className="text-saffron">Gig Apps vs Civic Direct Hire</span>
        </h2>
        <p className="text-sm text-mutedText mt-2">
          Slide horizontally to compare expensive commercial gig apps against verified local direct hiring.
        </p>
      </div>

      {/* Focus Frame Container */}
      <div className="relative w-full h-[380px] md:h-[420px] rounded-3xl overflow-hidden border-2 border-emerald-500/50 shadow-xl select-none">
        
        {/* RIGHT LAYER: GOOD / SAFE (Emerald Mint + Navy + Saffron) */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-pureWhite p-8 flex flex-col justify-between items-end text-right">
          <div className="flex items-center justify-end gap-3">
            <div>
              <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 text-[10px] font-mono uppercase font-bold tracking-wider mb-1">
                ✓ Gov-Verified Civic Portal
              </span>
              <h3 className="text-xl md:text-2xl font-extrabold text-govBlue-900">
                Direct Local Hiring & Mutual Trust
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/50 text-emerald-600 shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-md ml-auto">
            <div className="p-4 rounded-xl bg-pureWhite border border-emerald-200 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Platform Commission</span>
              <span className="text-2xl font-black font-mono text-emerald-600">₹0 (0%)</span>
            </div>
            <div className="p-4 rounded-xl bg-pureWhite border border-emerald-200 shadow-sm">
              <span className="text-xs text-slate-500 block mb-1">Both Sides Verified</span>
              <span className="text-2xl font-black font-mono text-emerald-600">Gov-ID eKYC</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 text-xs font-medium text-emerald-800 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-200">
            <span>Rough locality first, exact address after selection, 100% direct pay</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
        </div>

        {/* LEFT LAYER: NOT GOOD / RISKY (Soft Rose-Gray + Crimson Red) */}
        <div
          style={{ width: `${sliderPos}%` }}
          className="absolute inset-0 bg-gradient-to-br from-red-50 via-rose-50/70 to-slate-100 border-r-2 border-slate-400 p-8 flex flex-col justify-between overflow-hidden z-10"
        >
          <div className="w-[320px] sm:w-[440px]">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-300 text-red-600 shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 rounded bg-red-500/15 text-red-700 text-[10px] font-mono uppercase font-bold tracking-wider mb-1">
                  ✕ Traditional Gig Apps & Informal Deals
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-slate-800">
                  High Fees & Unverified Strangers
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-6">
              <div className="p-4 rounded-xl bg-white/80 border border-red-200/80">
                <span className="text-xs text-slate-500 block mb-1">Middleman Commission</span>
                <span className="text-2xl font-black font-mono text-red-600">25 - 40%</span>
              </div>
              <div className="p-4 rounded-xl bg-white/80 border border-red-200/80">
                <span className="text-xs text-slate-500 block mb-1">Identity & Safety</span>
                <span className="text-2xl font-black font-mono text-red-600">Unverified</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-red-800 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-200 w-fit mt-8">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>Heavy platform cuts on apps, or safety risk with unverified contacts</span>
            </div>
          </div>
        </div>

        {/* Slider Handle */}
        <input
          type="range"
          min="10"
          max="90"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
        />

        {/* Visual Line Divider Reticle */}
        <div
          style={{ left: `${sliderPos}%` }}
          className="absolute top-0 bottom-0 -translate-x-1/2 w-1 bg-govBlue-900 pointer-events-none z-15 flex items-center justify-center"
        >
          <div className="w-9 h-9 rounded-full bg-pureWhite border-2 border-govBlue-900 text-govBlue-900 flex items-center justify-center font-mono text-xs font-black shadow-lg">
            ↔
          </div>
        </div>
      </div>
    </div>
  );
}