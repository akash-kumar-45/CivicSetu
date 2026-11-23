import React from "react";
import Link from "next/link";
import { ShieldCheck, MapPin, Lock, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-govBlue-950 border-t border-govBlue-800 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10">
        {/* Top Multi-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-govBlue-800/80">
          {/* Column 1: Brand & Civic Mission */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="p-2.5 rounded-xl bg-saffron/15 border border-saffron/40 text-saffron group-hover:bg-saffron/20 transition">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-lg text-pureWhite tracking-tight block leading-none">
                  Civic<span className="text-saffron">Setu</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
                  Hyperlocal Work Portal
                </span>
              </div>
            </Link>

            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
              Public digital infrastructure connecting ID-verified residents with skilled independent workers in their local ward—with ₹0 middleman commissions.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-govBlue-900 border border-govBlue-700/70 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>e-KYC & DigiLocker Ready Architecture</span>
            </div>
          </div>

          {/* Column 2: For Citizens & Workers */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-pureWhite font-bold mb-4">
              Portal Services
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link href="/listings" className="hover:text-saffron transition">
                  Browse Local Jobs
                </Link>
              </li>
              <li>
                <Link href="/register?role=owner" className="hover:text-saffron transition">
                  Post a Job (Rough Area First)
                </Link>
              </li>
              <li>
                <Link href="/register?role=worker" className="hover:text-saffron transition">
                  Register as Local Worker
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-saffron transition">
                  Citizen & Worker Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Civic Trust & Safety */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-pureWhite font-bold mb-4">
              Safety & Privacy Protocol
            </h4>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-saffron shrink-0 mt-0.5" />
                <span>Mutual Gov-ID verification for both job posters and workers</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-saffron shrink-0 mt-0.5" />
                <span>Two-stage address privacy (exact location unlocks post-match)</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indiaGreen shrink-0 mt-0.5" />
                <span>100% direct UPI or cash settlement with zero platform cuts</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Governance & Resources */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-pureWhite font-bold mb-4">
              Governance & Transparency
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link href="/#how-it-works" className="hover:text-saffron transition">
                  5-Step Direct Hiring Flow
                </Link>
              </li>
              <li>
                <Link href="/listings" className="hover:text-saffron transition">
                  Ward-Level Directory
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-saffron transition"
                >
                  <span>Open-Source Repository</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Civic Compliance Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400">
          <p>
            © {new Date().getFullYear()} CivicSetu Hyperlocal Work Initiative. Built as open civic digital infrastructure.
          </p>
          <div className="flex flex-wrap items-center gap-4 font-mono">
            <span className="text-gray-400">Zero Commission</span>
            <span className="text-govBlue-700">•</span>
            <span className="text-gray-400">Two-Way Civic Ratings</span>
            <span className="text-govBlue-700">•</span>
            <span className="text-saffron">Civic Prototype</span>
          </div>
        </div>
      </div>
    </footer>
  );
}