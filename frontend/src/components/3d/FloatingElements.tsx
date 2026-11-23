"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  HeartHandshake,
  IndianRupee,
  Lock,
  CheckCircle2,
  Users,
  Sparkles,
  FileCheck2,
  Clock,
} from "lucide-react";

const FLOATING_BADGES = [
  // Left Gutter (Top to Bottom)
  {
    text: "100% Escrow Protected",
    icon: ShieldCheck,
    iconColor: "text-saffron",
    borderColor: "border-saffron/60",
    position: "top-[9%] left-[2.5%]",
    yRange: [0, -14, 0],
    rotateRange: [0, 2, -2, 0],
    duration: 7,
    delay: 0,
  },
  {
    text: "Zero Middleman Markups",
    icon: Sparkles,
    iconColor: "text-govBlue-900",
    borderColor: "border-govBlue-900/30",
    position: "top-[24%] left-[4%]",
    yRange: [0, 12, 0],
    rotateRange: [0, -2, 2, 0],
    duration: 8,
    delay: 0.8,
  },
  {
    text: "Verified Local Hubs",
    icon: Users,
    iconColor: "text-saffron",
    borderColor: "border-saffron/60",
    position: "top-[42%] left-[2%]",
    yRange: [0, -15, 0],
    rotateRange: [0, 3, -3, 0],
    duration: 7.5,
    delay: 1.5,
  },
  {
    text: "ID & Campus Checked",
    icon: CheckCircle2,
    iconColor: "text-indiaGreen",
    borderColor: "border-emerald-500/50",
    position: "top-[61%] left-[3.5%]",
    yRange: [0, 14, 0],
    rotateRange: [0, -2.5, 2.5, 0],
    duration: 8.5,
    delay: 0.4,
  },
  {
    text: "24/7 Dispute Resolution",
    icon: HeartHandshake,
    iconColor: "text-saffron",
    borderColor: "border-saffron/60",
    position: "bottom-[10%] left-[2.5%]",
    yRange: [0, -12, 0],
    rotateRange: [0, 2, -2, 0],
    duration: 6.8,
    delay: 1.2,
  },

  // Right Gutter (Top to Bottom)
  {
    text: "Set Your Own Budget",
    icon: IndianRupee,
    iconColor: "text-saffron",
    borderColor: "border-saffron/60",
    position: "top-[14%] right-[2.5%]",
    yRange: [0, 15, 0],
    rotateRange: [0, -2.5, 2.5, 0],
    duration: 7.8,
    delay: 0.5,
  },
  {
    text: "Funds Locked Upfront",
    icon: Lock,
    iconColor: "text-govBlue-900",
    borderColor: "border-govBlue-900/30",
    position: "top-[31%] right-[4%]",
    yRange: [0, -14, 0],
    rotateRange: [0, 2, -2, 0],
    duration: 8.2,
    delay: 1.3,
  },
  {
    text: "Instant UPI & Bank Payouts",
    icon: Zap,
    iconColor: "text-indiaGreen",
    borderColor: "border-emerald-500/50",
    position: "top-[49%] right-[2%]",
    yRange: [0, 16, 0],
    rotateRange: [0, -3, 3, 0],
    duration: 7.2,
    delay: 0.2,
  },
  {
    text: "Direct Owner-Worker Bids",
    icon: FileCheck2,
    iconColor: "text-saffron",
    borderColor: "border-saffron/60",
    position: "top-[68%] right-[3.5%]",
    yRange: [0, -13, 0],
    rotateRange: [0, 2.5, -2.5, 0],
    duration: 8.8,
    delay: 1.7,
  },
  {
    text: "Same-Day Task Matching",
    icon: Clock,
    iconColor: "text-govBlue-900",
    borderColor: "border-govBlue-900/30",
    position: "bottom-[8%] right-[2.5%]",
    yRange: [0, 12, 0],
    rotateRange: [0, -2, 2, 0],
    duration: 6.5,
    delay: 0.9,
  },
];

export function FloatingElements() {
  return (
    <div className="pointer-events-none absolute top-[100vh] bottom-0 left-0 right-0 overflow-hidden z-20">
      {/* Ambient Radial Gradients */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-saffron/10 blur-[130px] -z-10" />
      <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full bg-govBlue-800/5 blur-[150px] -z-10" />
      <div className="absolute -bottom-32 left-1/3 w-[550px] h-[550px] rounded-full bg-saffron/8 blur-[140px] -z-10" />

      {/* Dense Floating Micro-Badges */}
      {FLOATING_BADGES.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <motion.div
            key={index}
            animate={{
              y: badge.yRange,
              rotate: badge.rotateRange,
            }}
            transition={{
              duration: badge.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: badge.delay,
            }}
            className={`absolute ${badge.position} hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-pureWhite/95 border ${badge.borderColor} shadow-md backdrop-blur-md`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${badge.iconColor}`} />
            <span className="text-xs font-mono text-govBlue-900 font-bold whitespace-nowrap">
              {badge.text}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}