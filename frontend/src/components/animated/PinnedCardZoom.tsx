"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export function PinnedCardZoom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // 3D Card Zooms & Transforms
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.05, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [20, 0, -5]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.9]);
  const glow = useTransform(scrollYProgress, [0, 0.5, 1], [
    "0 0 10px rgba(0, 255, 102, 0.1)",
    "0 0 45px rgba(0, 255, 102, 0.4)",
    "0 0 20px rgba(0, 255, 102, 0.2)",
  ]);

  return (
    <div ref={containerRef} className="relative h-[160vh] bg-midnight-950">
      {/* Sticky Pinned Container */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Pinned Heading */}
        <div className="text-center mb-8 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-lime-neon/10 border border-lime-neon/40 text-lime-neon font-mono text-xs uppercase tracking-widest mb-3">
            Pure Cooperative Economics
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-pureWhite tracking-tight">
            Every Hour Holds <span className="text-lime-neon">Equal Worth</span>
          </h2>
          <p className="text-sm md:text-base text-zinc-400 mt-3">
            No fiat speculation. No market exploitation. 1 hour of plumbing equals 1 hour of math tutoring.
          </p>
        </div>

        {/* 3D Zooming Card */}
        <motion.div
          style={{
            scale,
            rotateX,
            opacity,
            boxShadow: glow,
          }}
          className="w-full max-w-3xl rounded-3xl glass-panel-lime border border-lime-neon/40 p-8 md:p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-lime-neon/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="p-5 rounded-2xl bg-midnight-900/80 border border-zinc-800">
              <span className="text-xs font-mono text-lime-neon">PRINCIPLE 01</span>
              <h3 className="text-lg font-bold text-pureWhite mt-1 mb-2">Egalitarian Time</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Skill level does not dictate value. All community members receive equivalent purchasing power.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-midnight-900/80 border border-zinc-800">
              <span className="text-xs font-mono text-lime-neon">PRINCIPLE 02</span>
              <h3 className="text-lg font-bold text-pureWhite mt-1 mb-2">Isolated Groups</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Hostels, housing societies, and wards maintain autonomous credit networks with vetted local members.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-midnight-900/80 border border-zinc-800">
              <span className="text-xs font-mono text-lime-neon">PRINCIPLE 03</span>
              <h3 className="text-lg font-bold text-pureWhite mt-1 mb-2">Append-Only Safety</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Every transaction is permanently audited. Balances cannot go negative and duplicate claims roll back.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-lime-neon" />
              <span>Deterministic State Machine Guarded</span>
            </div>
            <Link
              href="/listings"
              className="py-2.5 px-5 rounded-xl bg-lime-neon text-midnight-950 font-bold hover:bg-lime-bright transition flex items-center gap-2 text-xs shadow-neon-sm"
            >
              <span>Explore Active Listings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
