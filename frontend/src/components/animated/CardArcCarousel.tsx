"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Star,
  UserCheck,
  Inbox,
  Plus,
  MapPin,
} from "lucide-react";
import Link from "next/link";

interface JobItem {
  id: string;
  category: string;
  title: string;
  budget: number;
  roughLocation: string;
  status: string;
  ownerName: string;
  rating?: number;
}

export function CardArcCarousel() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetch("/api/listings")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.listings;
        if (list && list.length > 0) {
          const mapped: JobItem[] = list.map((item: any) => ({
            id: item.id || item._id,
            category: item.category || "General Service",
            title: item.title,
            budget: item.budget ?? item.price ?? item.credits ?? 0,
            roughLocation: item.roughLocation || item.location || item.ward || "Local Ward",
            status: item.status || "OPEN",
            ownerName: item.owner?.name || item.ownerName || "Verified Citizen",
            rating: item.owner?.rating || 4.9,
          }));
          setJobs(mapped);
          setActiveIndex(Math.floor(mapped.length / 2));
        } else {
          setJobs([]);
        }
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const prev = () => {
    setActiveIndex((curr) => (curr > 0 ? curr - 1 : jobs.length - 1));
  };

  const next = () => {
    setActiveIndex((curr) => (curr < jobs.length - 1 ? curr + 1 : 0));
  };

  return (
    <div className="relative w-full py-16 bg-pureWhite overflow-hidden">
      <div className="text-center max-w-xl mx-auto px-4 mb-12">
        <span className="inline-block px-3 py-1 rounded-full bg-saffron/10 border border-saffron/30 text-saffron font-mono text-xs uppercase tracking-wider mb-2">
          Live Local Job Board
        </span>
        <h2 className="text-2xl md:text-4xl font-extrabold text-govBlue-900">
          Open Jobs <span className="text-saffron">In Your Area</span>
        </h2>
        <p className="text-xs md:text-sm text-mutedText mt-2">
          Browse verified local jobs showing rough ward areas—apply directly and keep 100% of your earnings.
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <p className="text-xs font-mono uppercase tracking-wider text-mutedText animate-pulse">
            Checking local job board...
          </p>
        </div>
      ) : jobs.length === 0 ? (
        /* Empty Database State */
        <div className="max-w-md mx-auto px-4">
          <div className="p-8 rounded-3xl gov-panel border border-borderLight text-center shadow-gov-sm">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-saffron/10 border border-saffron/30 flex items-center justify-center text-saffron mb-4">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-govBlue-900">
              No Local Jobs Posted Right Now
            </h3>
            <p className="text-xs md:text-sm text-mutedText mt-2 leading-relaxed">
              The live neighborhood job board is currently clear. Post a job with your rough locality to connect with ID-verified local workers.
            </p>
            <Link
              href="/listings"
              className="mt-6 inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-saffron text-pureWhite font-bold hover:bg-saffron-dark transition text-xs shadow-saffron-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Post a Local Job</span>
            </Link>
          </div>
        </div>
      ) : (
        /* 3D Arc Carousel Track (Renders automatically once jobs exist in DB) */
        <>
          <div className="relative h-[400px] flex items-center justify-center max-w-5xl mx-auto perspective-1000">
            {jobs.map((item, idx) => {
              const offset = idx - activeIndex;
              const absOffset = Math.abs(offset);

              if (absOffset > 2) return null;

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
                      ? "gov-panel-saffron border-2 border-saffron shadow-saffron-md z-30"
                      : "gov-panel border border-borderLight z-10 hover:border-borderMedium"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-indiaGreen/20 text-indiaGreen border border-indiaGreen/40">
                      {item.status}
                    </span>

                    <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{item.rating}</span>
                    </div>
                  </div>

                  <span className="text-[11px] text-mutedText uppercase tracking-wider font-mono">
                    {item.category}
                  </span>
                  <h3 className="text-base font-bold text-govBlue-900 mt-1 mb-2 line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Rough Locality Badge (Privacy-First) */}
                  <div className="flex items-center gap-1.5 text-xs text-mutedText mb-4">
                    <MapPin className="w-3.5 h-3.5 text-saffron shrink-0" />
                    <span className="truncate">{item.roughLocation} (Approx.)</span>
                  </div>

                  <div className="pt-4 border-t border-borderLight flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-bodyText">
                      <UserCheck className="w-3.5 h-3.5 text-saffron" />
                      <span>{item.ownerName}</span>
                    </div>

                    <div className="flex items-center gap-0.5 font-mono text-sm text-saffron font-bold">
                      <IndianRupee className="w-3.5 h-3.5" />
                      <span>{item.budget}</span>
                    </div>
                  </div>

                  {isCenter && (
                    <div className="mt-4 pt-3 border-t border-borderLight text-center">
                      <Link
                        href="/listings"
                        className="inline-block text-xs font-semibold text-saffron hover:underline"
                      >
                        Apply for This Job →
                      </Link>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          {jobs.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={prev}
                aria-label="Previous job"
                className="p-3 rounded-full bg-lightBg border border-borderLight text-darkText hover:border-saffron hover:text-saffron transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-mono text-mutedText">
                {activeIndex + 1} / {jobs.length}
              </span>
              <button
                onClick={next}
                aria-label="Next job"
                className="p-3 rounded-full bg-lightBg border border-borderLight text-darkText hover:border-saffron hover:text-saffron transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}