"use client";

import React from "react";
import { ShieldCheck, Clock, Users, Database } from "lucide-react";

interface StackCardItem {
  id: number;
  title: string;
  badge: string;
  desc: string;
  icon: any;
  metric: string;
  metricLabel: string;
}

const CARDS: StackCardItem[] = [
  {
    id: 1,
    title: "Zero Fiat Currency",
    badge: "PILLAR I",
    desc: "Transactions are executed strictly with time credits. There are no debit cards, no processing fees, and no financial intermediaries.",
    icon: Clock,
    metric: "0% Fees",
    metricLabel: "No transaction extraction",
  },
  {
    id: 2,
    title: "1 Hour = 1 Credit Equality",
    badge: "PILLAR II",
    desc: "Every human hour contributes equally to the community. 60 minutes of babysitting earns the exact same credit as 60 minutes of computer repair.",
    icon: Users,
    metric: "1 : 1",
    metricLabel: "Time parity ratio",
  },
  {
    id: 3,
    title: "Isolated Cooperative Groups",
    badge: "PILLAR III",
    desc: "Each cooperative group represents an autonomous locality. Members are vetted and approved by designated group admins before participating.",
    icon: ShieldCheck,
    metric: "100%",
    metricLabel: "Data & tenant isolation",
  },
  {
    id: 4,
    title: "Append-Only Audit Ledger",
    badge: "PILLAR IV",
    desc: "Balances are never stored as mutable numbers. Every time credit is derived on the fly from an append-only cryptographic ledger of completed bookings.",
    icon: Database,
    metric: "Atomic",
    metricLabel: "Rollback on failure",
  },
];

export function StackingCards() {
  return (
    <div className="relative py-20 px-4 max-w-4xl mx-auto bg-midnight-950">
      <div className="text-center mb-16">
        <span className="inline-block px-3 py-1 rounded-full bg-lime-neon/10 border border-lime-neon/40 text-lime-neon font-mono text-xs uppercase tracking-widest mb-3">
          Architecture Pillars
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-pureWhite tracking-tight">
          Stacking <span className="text-lime-neon">Core Protocols</span>
        </h2>
        <p className="text-sm md:text-base text-zinc-400 mt-2">
          Engineered for strict integrity, egalitarian mutual aid, and zero financial distortion.
        </p>
      </div>

      {/* Stacked Cards Container */}
      <div className="space-y-8">
        {CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              style={{
                top: `${80 + idx * 28}px`,
              }}
              className="sticky rounded-3xl glass-panel-lime border border-lime-neon/30 p-8 shadow-2xl transition-all"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-lime-neon/20 border border-lime-neon/40 text-[11px] font-mono text-lime-neon font-bold">
                      {card.badge}
                    </span>
                    <Icon className="w-5 h-5 text-lime-neon" />
                  </div>
                  <h3 className="text-2xl font-bold text-pureWhite mb-2">{card.title}</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed max-w-xl">{card.desc}</p>
                </div>

                <div className="p-4 rounded-2xl bg-midnight-900 border border-zinc-800 text-center min-w-[150px]">
                  <div className="text-2xl font-black font-mono text-lime-neon">{card.metric}</div>
                  <div className="text-[11px] text-zinc-400 mt-1 uppercase tracking-wider font-mono">
                    {card.metricLabel}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
