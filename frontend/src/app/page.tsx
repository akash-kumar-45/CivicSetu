import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { TimeCreditToken3D } from "@/components/3d/TimeCreditToken";
import { FloatingElements } from "@/components/3d/FloatingElements";
import { LineRevealText } from "@/components/animated/LineRevealText";
import { SidewaysMarquee } from "@/components/animated/SidewaysMarquee";
import { LayeredParallax } from "@/components/animated/LayeredParallax";
import { PinnedCardZoom } from "@/components/animated/PinnedCardZoom";
import { CardArcCarousel } from "@/components/animated/CardArcCarousel";
import { StackingCards } from "@/components/animated/StackingCards";
import { FocusFrameSliders } from "@/components/animated/FocusFrameSliders";
import { ScrollTriggeredDemo } from "@/components/animated/ScrollTriggeredDemo";
import { Clock, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-midnight-950 text-pureWhite selection:bg-lime-neon selection:text-midnight-950">
      {/* Floating Elements Background */}
      <FloatingElements />

      {/* Global Navbar */}
      <Navbar />

      {/* Hero Section with Layered Parallax, Line Reveal, and 3D Token */}
      <LayeredParallax>
        <section className="relative pt-12 md:pt-20 pb-16 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Hero Left Typography */}
          <div className="flex-1 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-neon/10 border border-lime-neon/40 text-lime-neon font-mono text-xs uppercase tracking-wider mb-6 shadow-neon-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cooperative Time-Bank Protocol</span>
            </div>

            {/* Line by Line Reveal Hero Headings */}
            <LineRevealText
              lines={[
                "Household Services.",
                "Egalitarian Exchange.",
                "Zero Real Money.",
              ]}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight"
              lineClassName="text-pureWhite"
            />

            <p className="mt-6 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl">
              Exchange cleaning, cooking, tutoring, repairs, and childcare with your neighbors.
              Powered by strict <span className="text-lime-neon font-semibold">1 Hour = 1 Credit</span> time-banking
              and an append-only audit ledger.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="py-3.5 px-6 rounded-xl bg-lime-neon text-midnight-950 font-bold hover:bg-lime-bright transition shadow-neon-sm hover:shadow-neon-md flex items-center gap-2 text-sm cursor-pointer"
              >
                <span>Join Local Co-op</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/listings"
                className="py-3.5 px-6 rounded-xl bg-midnight-900 border border-zinc-800 text-pureWhite hover:border-lime-neon/60 hover:text-lime-neon transition text-sm font-semibold cursor-pointer"
              >
                <span>Browse Service Listings</span>
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 pt-8 border-t border-zinc-800/80">
              <div>
                <span className="block text-2xl font-black font-mono text-lime-neon">1 : 1</span>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Hour to Credit</span>
              </div>
              <div>
                <span className="block text-2xl font-black font-mono text-pureWhite">0%</span>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Fiat Fees</span>
              </div>
              <div>
                <span className="block text-2xl font-black font-mono text-lime-bright">100%</span>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Group Isolated</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Fixed 3D Interactive Model */}
          <div className="flex-1 w-full max-w-md lg:max-w-none flex justify-center">
            <div className="w-full max-w-[440px] p-4 rounded-3xl glass-panel-lime border border-lime-neon/40 shadow-neon-md">
              <TimeCreditToken3D />
            </div>
          </div>
        </section>
      </LayeredParallax>

      {/* Sideways Text Marquee */}
      <SidewaysMarquee />

      {/* Pinned Heading with 3D Card Zoom */}
      <PinnedCardZoom />

      {/* 3D Rotational Card Arc Carousel */}
      <CardArcCarousel />

      {/* Stacking Protocol Cards */}
      <StackingCards />

      {/* Interactive Focus Frame Slider (Comparison) */}
      <FocusFrameSliders />

      {/* Scroll Triggered Lifecycle Demo */}
      <ScrollTriggeredDemo />

      {/* Pre-Footer Call to Action */}
      <section className="relative py-20 px-4 bg-midnight-950 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto p-10 md:p-14 rounded-3xl glass-panel-lime border border-lime-neon/40 shadow-neon-lg text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-lime-neon/15 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl md:text-5xl font-black text-pureWhite tracking-tight">
            Ready to Build a Cooperative Community?
          </h2>
          <p className="mt-4 text-sm md:text-base text-zinc-300 max-w-xl mx-auto">
            Launch a cooperative group for your housing society, hostel, or neighborhood today.
            Zero fiat integration, verified deterministic ledger.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/register"
              className="py-3.5 px-8 rounded-xl bg-lime-neon text-midnight-950 font-bold hover:bg-lime-bright transition shadow-neon-md text-sm"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
