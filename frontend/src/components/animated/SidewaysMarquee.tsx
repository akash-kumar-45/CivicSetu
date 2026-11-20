"use client";

import React from "react";
import { Sparkles, Clock, ShieldCheck, HeartHandshake, Zap, Scale } from "lucide-react";

export function SidewaysMarquee() {
  const items = [
    { text: "HOUSEHOLD CLEANING", icon: Sparkles },
    { text: "1 HOUR = 1 CREDIT", icon: Clock },
    { text: "ELECTRICAL & PLUMBING REPAIRS", icon: Zap },
    { text: "PEER TUTORING & MENTORSHIP", icon: Scale },
    { text: "HOME COOKING & BAKING", icon: HeartHandshake },
    { text: "IMMUTABLE AUDIT TRAIL", icon: ShieldCheck },
    { text: "CHILDCARE & BABYSITTING", icon: Sparkles },
    { text: "ZERO REAL MONEY OR FIAT", icon: Clock },
  ];

  return (
    <div className="relative w-full py-4 bg-midnight-950 border-y border-zinc-800/80 overflow-hidden select-none">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-midnight-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-midnight-950 to-transparent z-10 pointer-events-none" />

      <div className="flex w-max animate-marquee space-x-8">
        {[...items, ...items].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center space-x-3 px-4 py-1.5 rounded-full bg-midnight-900/60 border border-zinc-800 text-xs font-mono tracking-wider text-pureWhite uppercase"
            >
              <Icon className="w-3.5 h-3.5 text-lime-neon shrink-0" />
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
