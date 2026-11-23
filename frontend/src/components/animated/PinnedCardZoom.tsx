"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export function PinnedCardZoom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth out raw wheel/trackpad scroll ticks with a spring
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  // Smooth, gradual 3D zoom across 65% of the sticky scroll distance
  const scale = useTransform(smoothProgress, [0, 0.65, 1], [0.88, 1.08, 1.08]);
  const rotateX = useTransform(smoothProgress, [0, 0.65, 1], [14, 0, 0]);
  const y = useTransform(smoothProgress, [0, 0.65, 1], [30, 0, 0]);
  const opacity = useTransform(smoothProgress, [0, 0.2, 1], [0.75, 1, 1]);

  return (
    <div ref={containerRef} className="relative h-[145vh] bg-pureWhite">
      {/* Sticky Pinned Container with 3D Perspective */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center p-6 overflow-hidden [perspective:1200px]">
        {/* Pinned Heading */}
        <div className="text-center mb-8 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-saffron/10 border border-saffron/40 text-saffron font-mono text-xs uppercase tracking-widest mb-3">
            Civic Digital Infrastructure
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-govBlue-900 tracking-tight">
            Built for <span className="text-saffron">Hyperlocal Trust</span>
          </h2>
          <p className="text-sm md:text-base text-mutedText mt-3">
            Bridging neighbors who need help with skilled local workers—without corporate markups or privacy risks.
          </p>
        </div>

        {/* 3D Zooming Card (GPU-accelerated transforms only) */}
        <motion.div
          style={{
            scale,
            rotateX,
            y,
            opacity,
            transformStyle: "preserve-3d",
          }}
          className="w-full max-w-3xl rounded-3xl gov-panel-saffron border border-saffron/40 p-8 md:p-12 relative overflow-hidden shadow-saffron-md will-change-transform"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-saffron/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="p-5 rounded-2xl bg-lightBg border border-borderLight">
              <span className="text-xs font-mono text-saffron">PILLAR 01</span>
              <h3 className="text-lg font-bold text-govBlue-900 mt-1 mb-2">Mutual ID Verification</h3>
              <p className="text-xs text-mutedText leading-relaxed">
                Both job posters and workers verify their identity—ensuring safe home visits and genuine job postings.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-lightBg border border-borderLight">
              <span className="text-xs font-mono text-saffron">PILLAR 02</span>
              <h3 className="text-lg font-bold text-govBlue-900 mt-1 mb-2">Two-Stage Location</h3>
              <p className="text-xs text-mutedText leading-relaxed">
                Listings show only the rough locality first. Exact address unlocks only after a worker is selected.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-lightBg border border-borderLight">
              <span className="text-xs font-mono text-saffron">PILLAR 03</span>
              <h3 className="text-lg font-bold text-govBlue-900 mt-1 mb-2">Direct Settlement</h3>
              <p className="text-xs text-mutedText leading-relaxed">
                Workers keep 100% of their earnings via direct UPI or cash, backed by transparent two-way ratings.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-borderLight flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-mutedText">
              <ShieldCheck className="w-4 h-4 text-indiaGreen" />
              <span>e-KYC Ready • Zero Commission Public Portal</span>
            </div>
            <Link
              href="/listings"
              className="py-2.5 px-5 rounded-xl bg-saffron text-pureWhite font-bold hover:bg-saffron-dark transition flex items-center gap-2 text-xs shadow-saffron-sm"
            >
              <span>Browse Local Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}