"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Clock, Shield, LayoutDashboard, Layers, Users, LogOut, LogIn, Menu, X } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [balance, setBalance] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/ledger")
        .then((res) => res.json())
        .then((data) => {
          if (data.balance !== undefined) {
            setBalance(data.balance);
          }
        })
        .catch(() => {});
    }
  }, [session, pathname]);

  const navLinks = [
    { label: "Listings", href: "/listings", icon: Layers },
    { label: "Co-op Groups", href: "/groups", icon: Users },
    { label: "Bookings", href: "/bookings", icon: Clock },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-zinc-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-lime-neon/15 border border-lime-neon/40 text-lime-neon shadow-neon-sm">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-pureWhite">
              TimeBank<span className="text-lime-neon">Coop</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
              1h = 1c
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? "bg-lime-neon/15 text-lime-neon border border-lime-neon/30 shadow-neon-sm"
                    : "text-zinc-300 hover:text-pureWhite hover:bg-zinc-900/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Time Credit Balance & Auth */}
        <div className="hidden sm:flex items-center gap-3">
          {session?.user ? (
            <>
              {/* Credit Balance Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-midnight-900 border border-lime-neon/40 shadow-neon-sm">
                <Clock className="w-3.5 h-3.5 text-lime-neon" />
                <span className="text-xs font-mono font-bold text-lime-neon">
                  {balance !== null ? balance : "..."} Credits
                </span>
              </div>

              {/* User Dropdown / Sign Out */}
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                <span className="text-xs font-mono text-zinc-300">
                  {(session.user as any)?.name || "Member"}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  title="Sign out"
                  className="p-2 rounded-lg bg-midnight-900 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-pureWhite transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 rounded-lg bg-lime-neon text-midnight-950 font-bold hover:bg-lime-bright text-xs transition shadow-neon-sm"
              >
                Join Co-op
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-zinc-400 hover:text-pureWhite cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden p-4 border-t border-zinc-800 bg-midnight-950/95 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-lime-neon hover:bg-zinc-900"
            >
              {link.label}
            </Link>
          ))}
          {session?.user ? (
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-mono text-lime-neon">
                Balance: {balance !== null ? balance : 0} Credits
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-xs text-red-400 hover:underline"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-zinc-800 flex gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-xs text-zinc-300 rounded bg-midnight-900"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-xs font-bold text-midnight-950 rounded bg-lime-neon"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
