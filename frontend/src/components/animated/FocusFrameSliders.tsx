"use client";

import React, { useState } from "react";
import { DollarSign, Clock, ShieldAlert, ShieldCheck } from "lucide-react";

export function FocusFrameSliders() {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="relative py-20 px-4 max-w-4xl mx-auto bg-midnight-950">
      <div className="text-center mb-12">
        <span className="inline-block px-3 py-1 rounded-full bg-lime-neon/10 border border-lime-neon/40 text-lime-neon font-mono text-xs uppercase tracking-widest mb-3">
          Interactive Comparison
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-pureWhite tracking-tight">
          Focus Frame: <span className="text-lime-neon">Old Gig Economy vs TimeBank</span>
        </h2>
        <p className="text-sm text-zinc-400 mt-2">
          Slide horizontally to inspect how cooperative time-banking eliminates platform fee extraction.
        </p>
      </div>

      {/* Focus Frame Container */}
      <div className="relative w-full h-[380px] md:h-[420px] rounded-3xl overflow-hidden border-2 border-lime-neon shadow-neon-md select-none">
        {/* Right Layer (Cooperative Time Bank) */}
        <div className="absolute inset-0 bg-midnight-950 p-8 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-neon/20 border border-lime-neon text-lime-neon">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-lime-neon uppercase font-bold tracking-wider">
                Cooperative Platform
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-pureWhite">
                Egalitarian Time Credits
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div className="p-4 rounded-xl bg-midnight-900 border border-lime-neon/30">
              <span className="text-xs text-zinc-400 block mb-1">Platform Commission</span>
              <span className="text-2xl font-black font-mono text-lime-neon">0%</span>
            </div>
            <div className="p-4 rounded-xl bg-midnight-900 border border-lime-neon/30">
              <span className="text-xs text-zinc-400 block mb-1">Labor Valuation</span>
              <span className="text-2xl font-black font-mono text-lime-neon">1h = 1c</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <ShieldCheck className="w-4 h-4 text-lime-neon" />
            <span>Mutual community empowerment with append-only ledger</span>
          </div>
        </div>

        {/* Left Layer (Monetary Platform - Clipped by Slider) */}
        <div
          style={{ width: `${sliderPos}%` }}
          className="absolute inset-0 bg-zinc-950 border-r-2 border-lime-neon p-8 flex flex-col justify-between overflow-hidden z-10"
        >
          <div className="min-w-[320px]">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono text-red-400 uppercase font-bold tracking-wider">
                  Traditional Gig App
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-pureWhite">
                  Commercial Gig Extraction
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mt-6">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-xs text-zinc-400 block mb-1">Platform Commission</span>
                <span className="text-2xl font-black font-mono text-red-400">25 - 40%</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-xs text-zinc-400 block mb-1">Price Distortion</span>
                <span className="text-2xl font-black font-mono text-red-400">High Surges</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-8">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Surge algorithms and high middleman fees</span>
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
          className="absolute top-0 bottom-0 -translate-x-1/2 w-1 bg-lime-neon pointer-events-none z-15 flex items-center justify-center"
        >
          <div className="w-8 h-8 rounded-full bg-midnight-950 border-2 border-lime-neon text-lime-neon flex items-center justify-center font-mono text-[10px] font-bold shadow-neon-md">
            ↔
          </div>
        </div>
      </div>
    </div>
  );
}
