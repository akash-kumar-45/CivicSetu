"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, Shield, Sparkles, Zap, HeartHandshake } from "lucide-react";

export function FloatingElements() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {/* Ambient Neon Radial Gradients */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-lime-neon/10 blur-[130px]" />
      <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full bg-lime-neon/5 blur-[150px]" />
      <div className="absolute -bottom-32 left-1/3 w-[550px] h-[550px] rounded-full bg-lime-neon/8 blur-[140px]" />

      {/* Floating Micro-Badge 1 */}
      <motion.div
        animate={{
          y: [0, -18, 0],
          rotate: [0, 3, -3, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[18%] left-[8%] hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-midnight-900/70 border border-lime-neon/40 shadow-neon-sm backdrop-blur"
      >
        <Clock className="w-4 h-4 text-lime-neon" />
        <span className="text-xs font-mono text-pureWhite font-medium">1 Hour = 1 Credit</span>
      </motion.div>

      {/* Floating Micro-Badge 2 */}
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -4, 4, 0],
        }}
        transition={{
          duration: 8.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute top-[28%] right-[10%] hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-midnight-900/70 border border-lime-neon/40 shadow-neon-sm backdrop-blur"
      >
        <Shield className="w-4 h-4 text-lime-neon" />
        <span className="text-xs font-mono text-pureWhite font-medium">Immutable Ledger</span>
      </motion.div>

      {/* Floating Micro-Badge 3 */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          x: [0, 8, 0],
        }}
        transition={{
          duration: 6.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-[22%] left-[12%] hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-midnight-900/70 border border-lime-neon/40 shadow-neon-sm backdrop-blur"
      >
        <HeartHandshake className="w-4 h-4 text-lime-neon" />
        <span className="text-xs font-mono text-pureWhite font-medium">Neighborhood Co-op</span>
      </motion.div>

      {/* Floating Micro-Badge 4 */}
      <motion.div
        animate={{
          y: [0, 16, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute bottom-[30%] right-[14%] hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-midnight-900/70 border border-lime-neon/40 shadow-neon-sm backdrop-blur"
      >
        <Zap className="w-4 h-4 text-lime-bright" />
        <span className="text-xs font-mono text-pureWhite font-medium">Zero Real Money</span>
      </motion.div>
    </div>
  );
}
