"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function LayeredParallax({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Multi-depth layer translations
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const midgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const textScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.05, 0.95]);

  return (
    <div ref={containerRef} className="relative min-h-[90vh] overflow-hidden">
      {/* Background Layer: Grid and Geometric Matrix */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 pointer-events-none z-0 opacity-20"
      >
        <div
          className="w-full h-[150%] bg-[linear-gradient(to_right,#1f293d_1px,transparent_1px),linear-gradient(to_bottom,#1f293d_1px,transparent_1px)] bg-[size:4rem_4rem]"
        />
      </motion.div>

      {/* Midground Layer: Subtle Lime Accent Grid & Circles */}
      <motion.div
        style={{ y: midgroundY }}
        className="absolute inset-0 pointer-events-none z-0"
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full border border-lime-neon/15 -z-10" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full border border-zinc-800/40 -z-10" />
      </motion.div>

      {/* Foreground Interactive Content */}
      <motion.div style={{ scale: textScale }} className="relative z-10">
        {children}
      </motion.div>
    </div>
  );
}
