import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { FloatingElements } from "@/components/3d/FloatingElements";
import { LineRevealText } from "@/components/animated/LineRevealText";
import { SidewaysMarquee } from "@/components/animated/SidewaysMarquee";
import { LayeredParallax } from "@/components/animated/LayeredParallax";
import { PinnedCardZoom } from "@/components/animated/PinnedCardZoom";
import { CardArcCarousel } from "@/components/animated/CardArcCarousel";
import { FocusFrameSliders } from "@/components/animated/FocusFrameSliders";
import { ScrollTriggeredDemo } from "@/components/animated/ScrollTriggeredDemo";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-pureWhite text-darkText selection:bg-saffron selection:text-pureWhite">
      {/* Floating Elements Background (Starts below Hero section) */}
      <FloatingElements />

      {/* Global Navbar */}
      <Navbar />

      {/* Hero Section with Layered Parallax & Line Reveal */}
      <LayeredParallax>
        <section className="relative pt-12 md:pt-20 pb-16 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Hero Left Typography */}
          <div className="flex-1 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron/10 border border-saffron/40 text-saffron font-mono text-xs uppercase tracking-wider mb-6 shadow-gov-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CIVIC HYPERLOCAL WORK & DIRECT HIRING PORTAL</span>
            </div>

            {/* Line by Line Reveal Hero Headings */}
            <LineRevealText
              lines={[
                "Post a Local Job.",
                "Connect Directly.",
                "Pay Zero Fees.",
              ]}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight"
              lineClassName="text-govBlue-900"
            />

            <p className="mt-6 text-base sm:text-lg text-mutedText leading-relaxed max-w-xl">
              Need help with repairs, cleaning, tutoring, or errands—or looking for local work near home? Connect directly with{" "}
              <span className="text-saffron font-semibold">ID-Verified Neighbors & Skilled Workers</span>{" "}
              in your ward with two-stage location privacy and zero middleman commissions.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="py-3.5 px-6 rounded-xl bg-saffron text-pureWhite font-bold hover:bg-saffron-dark transition shadow-saffron-sm hover:shadow-saffron-md flex items-center gap-2 text-sm cursor-pointer"
              >
                <span>Post a Local Job</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/listings"
                className="py-3.5 px-6 rounded-xl bg-pureWhite border border-borderMedium text-darkText hover:border-saffron hover:text-saffron transition text-sm font-semibold cursor-pointer"
              >
                <span>Find Work Near You</span>
              </Link>
            </div>

            {/* Stat Boxes */}
            <div className="mt-8 grid grid-cols-3 gap-4 pt-8 border-t border-borderLight">
              <div>
                <span className="block text-2xl font-black font-mono text-saffron">100%</span>
                <span className="text-xs text-mutedText uppercase tracking-wider">ID Verified Users</span>
              </div>
              <div>
                <span className="block text-2xl font-black font-mono text-govBlue-900">₹0</span>
                <span className="text-xs text-mutedText uppercase tracking-wider">Middleman Fee</span>
              </div>
              <div>
                <span className="block text-2xl font-black font-mono text-indiaGreen">WARD</span>
                <span className="text-xs text-mutedText uppercase tracking-wider">Hyperlocal Hubs</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Trust & Direct Hiring Illustration */}
          <div className="flex-1 w-full flex justify-center lg:justify-start lg:-ml-8">
            <img
              src="/images/escrow-hero.png"
              alt="ID-verified hyperlocal task hiring workflow"
              className="w-full max-w-[380px] lg:max-w-[420px] h-auto object-contain mix-blend-multiply select-none"
            />
          </div>
        </section>
      </LayeredParallax>

      {/* Sideways Text Marquee */}
      <SidewaysMarquee />

      {/* Pinned Heading with 3D Card Zoom */}
      <PinnedCardZoom />

      {/* 3D Rotational Card Arc Carousel */}
      <CardArcCarousel />

      {/* Interactive Focus Frame Slider (Comparison) */}
      <FocusFrameSliders />

      {/* Scroll Triggered Lifecycle Demo */}
      <ScrollTriggeredDemo />

      {/* Pre-Footer Call to Action */}
      <section className="relative py-20 px-4 bg-lightBlueBg border-t border-borderLight">
        <div className="max-w-4xl mx-auto p-10 md:p-14 rounded-3xl gov-panel-saffron border border-saffron/40 shadow-gov-lg text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-saffron/15 rounded-full blur-3xl pointer-events-none" />
          <span className="inline-block px-3 py-1 rounded-full bg-saffron/15 border border-saffron/40 text-saffron font-mono text-xs uppercase tracking-widest mb-4">
            e-KYC & Civic Ward Portal
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-govBlue-900 tracking-tight">
            Ready to Hire Locally or Find Work Near You?
          </h2>
          <p className="mt-4 text-sm md:text-base text-bodyText max-w-xl mx-auto">
            Join your verified neighborhood ward today. Connect directly with ID-verified citizens and local workers with ₹0 middleman commissions.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/register?role=owner"
              className="py-3.5 px-7 rounded-xl bg-saffron text-pureWhite font-bold hover:bg-saffron-dark transition shadow-saffron-md text-sm"
            >
              Post a Local Job →
            </Link>
            <Link
              href="/register?role=worker"
              className="py-3.5 px-7 rounded-xl bg-pureWhite border border-govBlue-900/20 text-govBlue-900 font-bold hover:border-saffron hover:text-saffron transition text-sm"
            >
              Join as a Local Worker
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}