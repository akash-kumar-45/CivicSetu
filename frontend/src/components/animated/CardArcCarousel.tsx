"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Star, Sparkles, UserCheck } from "lucide-react";
import Link from "next/link";

interface ArcItem {
  id: string;
  category: string;
  title: string;
  credits: number;
  type: "OFFER" | "REQUEST";
  owner: string;
  rating: number;
}

const SAMPLE_LISTINGS: ArcItem[] = [
  {
    id: "1",
    category: "Household Cleaning",
    title: "Apartment Deep Clean & Dusting",
    credits: 2,
    type: "OFFER",
    owner: "Maya Patel",
    rating: 4.9,
  },
  {
    id: "2",
    category: "Tutoring",
    title: "Linear Algebra & Discrete Math",
    credits: 1,
    type: "OFFER",
    owner: "Rohan Verma",
    rating: 5.0,
  },
  {
    id: "3",
    category: "Home Repairs",
    title: "Kitchen Sink Leak & Tap Fix",
    credits: 1,
    type: "REQUEST",
    owner: "Priya Sharma",
    rating: 4.8,
  },
  {
    id: "4",
    category: "Culinary & Meals",
    title: "Home Cooked Weekend Meal Prep",
    credits: 3,
    type: "OFFER",
    owner: "Dev Anand",
    rating: 4.9,
  },
  {
    id: "5",
    category: "Childcare & Babysitting",
    title: "Evening Childcare & Storytelling",
    credits: 2,
    type: "OFFER",
    owner: "Ananya Iyer",
    rating: 5.0,
  },
];

export function CardArcCarousel() {
  const [activeIndex, setActiveIndex] = useState(2);

  const prev = () => {
    setActiveIndex((curr) => (curr > 0 ? curr - 1 : SAMPLE_LISTINGS.length - 1));
  };

  const next = () => {
    setActiveIndex((curr) => (curr < SAMPLE_LISTINGS.length - 1 ? curr + 1 : 0));
  };

  return (
    <div className="relative w-full py-16 bg-midnight-950 overflow-hidden">
      <div className="text-center max-w-xl mx-auto px-4 mb-12">
        <span className="inline-block px-3 py-1 rounded-full bg-lime-neon/10 border border-lime-neon/30 text-lime-neon font-mono text-xs uppercase tracking-wider mb-2">
          Rotational Arc Showcase
        </span>
        <h2 className="text-2xl md:text-4xl font-extrabold text-pureWhite">
          Community <span className="text-lime-neon">Service Exchange</span>
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 mt-2">
          Browse offerings and urgent requests posted by verified cooperative members.
        </p>
      </div>

      {/* 3D Arc Carousel Track */}
      <div className="relative h-[380px] flex items-center justify-center max-w-5xl mx-auto perspective-1000">
        {SAMPLE_LISTINGS.map((item, idx) => {
          const offset = idx - activeIndex;
          const absOffset = Math.abs(offset);

          // Calculate 3D arc position
          const rotateY = offset * -22;
          const translateZ = -absOffset * 110;
          const translateX = offset * 210;
          const opacity = Math.max(0.25, 1 - absOffset * 0.35);
          const isCenter = offset === 0;

          return (
            <motion.div
              key={item.id}
              animate={{
                x: translateX,
                z: translateZ,
                rotateY: rotateY,
                opacity: opacity,
                scale: isCenter ? 1.05 : 0.88,
              }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 24,
              }}
              onClick={() => setActiveIndex(idx)}
              className={`absolute w-72 md:w-80 p-6 rounded-2xl cursor-pointer select-none transition-shadow ${
                isCenter
                  ? "glass-panel-lime border-2 border-lime-neon shadow-neon-md z-30"
                  : "glass-panel border border-zinc-800 z-10 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider ${
                    item.type === "OFFER"
                      ? "bg-lime-neon/20 text-lime-neon border border-lime-neon/40"
                      : "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                  }`}
                >
                  {item.type}
                </span>

                <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{item.rating}</span>
                </div>
              </div>

              <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-mono">
                {item.category}
              </span>
              <h3 className="text-base font-bold text-pureWhite mt-1 mb-4 line-clamp-2">
                {item.title}
              </h3>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                  <UserCheck className="w-3.5 h-3.5 text-lime-neon" />
                  <span>{item.owner}</span>
                </div>

                <div className="flex items-center gap-1 font-mono text-sm text-lime-neon font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.credits} C/hr</span>
                </div>
              </div>

              {isCenter && (
                <div className="mt-4 pt-3 border-t border-lime-neon/20 text-center">
                  <Link
                    href="/listings"
                    className="inline-block text-xs font-semibold text-lime-neon hover:underline"
                  >
                    View in Catalog →
                  </Link>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={prev}
          aria-label="Previous listing"
          className="p-3 rounded-full bg-midnight-900 border border-zinc-800 text-pureWhite hover:border-lime-neon hover:text-lime-neon transition cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-mono text-zinc-500">
          {activeIndex + 1} / {SAMPLE_LISTINGS.length}
        </span>
        <button
          onClick={next}
          aria-label="Next listing"
          className="p-3 rounded-full bg-midnight-900 border border-zinc-800 text-pureWhite hover:border-lime-neon hover:text-lime-neon transition cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
