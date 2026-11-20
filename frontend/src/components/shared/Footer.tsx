import React from "react";
import Link from "next/link";
import { Clock, ShieldCheck, HeartHandshake } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-midnight-950 border-t border-zinc-900 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-lime-neon/10 border border-lime-neon/30 text-lime-neon">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-pureWhite tracking-tight">
              TimeBank<span className="text-lime-neon">Coop</span>
            </span>
            <p className="text-xs text-zinc-500 mt-0.5">
              Egalitarian cooperative platform for community & household services.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-zinc-400">
          <Link href="/listings" className="hover:text-lime-neon transition">
            Listings
          </Link>
          <Link href="/groups" className="hover:text-lime-neon transition">
            Groups
          </Link>
          <Link href="/dashboard" className="hover:text-lime-neon transition">
            Ledger Audit
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-lime-neon transition"
          >
            GitHub
          </a>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
          <ShieldCheck className="w-4 h-4 text-lime-neon" />
          <span>PostgreSQL Append-Only Ledger • Strict Isolation</span>
        </div>
      </div>
    </footer>
  );
}
