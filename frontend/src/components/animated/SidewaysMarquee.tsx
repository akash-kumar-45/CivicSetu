"use client";

import React from "react";
import { Sparkles, Clock, ShieldCheck, HeartHandshake, Zap, Scale } from "lucide-react";

export function SidewaysMarquee() {
  const items = [
    { text: "GOV-ID VERIFIED PROFILES", icon: ShieldCheck },
    { text: "ELECTRICAL & PLUMBING REPAIRS", icon: Zap },
    { text: "ZERO MIDDLEMAN COMMISSIONS", icon: Scale },
    { text: "PRIVACY-FIRST LOCATION UNLOCK", icon: ShieldCheck },
    { text: "DIRECT OWNER-WORKER DEALS", icon: HeartHandshake },
    { text: "LOCAL TUTORING & TECH HELP", icon: Sparkles },
    { text: "MUTUAL SAFETY RATINGS", icon: Clock },
    { text: "HOUSEHOLD CLEANING & SHIFTING", icon: Sparkles },
  ];

  return (
    <div className="relative w-full py-4 bg-lightBlueBg border-y border-borderLight overflow-hidden select-none">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-lightBlueBg to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-lightBlueBg to-transparent z-10 pointer-events-none" />

      <div className="flex w-max animate-marquee space-x-8">
        {[...items, ...items].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center space-x-3 px-4 py-1.5 rounded-full bg-pureWhite border border-borderLight text-xs font-mono tracking-wider text-darkText uppercase"
            >
              <Icon className="w-3.5 h-3.5 text-saffron shrink-0" />
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}