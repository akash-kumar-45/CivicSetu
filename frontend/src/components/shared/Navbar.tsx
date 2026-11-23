"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  ShieldCheck,
  LayoutDashboard,
  Briefcase,
  MapPin,
  ClipboardCheck,
  Users,
  Bell,
  UserCircle,
  LogOut,
  Menu,
  X,
  BadgeCheck,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!session?.user) {
      setPendingCount(0);
      return;
    }

    let isMounted = true;
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/friends");
        if (res.ok && isMounted) {
          const data = await res.json();
          setPendingCount((data.incomingRequests || []).length);
        }
      } catch {
        // Ignore network errors for background polling
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [session, pathname]);

  const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Local Jobs", href: "/listings", icon: Briefcase },
    { label: "Local Wards", href: "/groups", icon: MapPin },
    { label: "My Hires & Work", href: "/bookings", icon: ClipboardCheck },
    { label: "Trusted Circle", href: "/friends", icon: Users, badge: pendingCount },
  ];

  const isVerified = (session?.user as any)?.isVerified ?? true;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-govBlue-900 border-b border-govBlue-800 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-saffron/15 border border-saffron/40 text-saffron">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex items-center">
            <span className="text-lg font-black tracking-tight text-pureWhite">
              Civic<span className="text-saffron">Setu</span>
            </span>
            <span className="hidden sm:inline-block ml-2.5 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-govBlue-800 border border-saffron/40 text-saffron font-semibold tracking-wider">
              ₹0 Fee • Direct Hire
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
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? "bg-saffron/15 text-saffron border border-saffron/30 shadow-saffron-sm"
                    : "text-gray-200 hover:text-pureWhite hover:bg-govBlue-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
                {typeof link.badge === "number" && link.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-saffron text-pureWhite text-[10px] font-mono font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Notifications, Civic Verification Status & Auth */}
        <div className="hidden sm:flex items-center gap-3">
          {session?.user ? (
            <>
              {/* Notification Bell */}
              <Link
                href="/friends"
                title={
                  pendingCount > 0
                    ? `${pendingCount} incoming Trusted Circle request(s)`
                    : "Trusted Circle & Notifications"
                }
                className="relative p-2 rounded-lg bg-govBlue-800 text-gray-200 hover:text-saffron hover:bg-govBlue-700 transition"
              >
                <Bell className="w-4 h-4" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-saffron text-pureWhite text-[10px] font-mono font-bold flex items-center justify-center shadow-saffron-sm">
                    {pendingCount}
                  </span>
                )}
              </Link>

              {/* Gov-ID Verification Badge Pill */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono font-bold ${
                  isVerified
                    ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-300"
                    : "bg-amber-500/15 border-amber-400/40 text-amber-300"
                }`}
              >
                <BadgeCheck className="w-3.5 h-3.5 shrink-0" />
                <span>{isVerified ? "Gov-ID Verified" : "Pending e-KYC"}</span>
              </div>

              {/* Profile Link & Sign Out */}
              <div className="flex items-center gap-2 pl-2 border-l border-govBlue-700">
                <Link
                  href="/profile"
                  title="Open My Profile"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition ${
                    pathname.startsWith("/profile")
                      ? "bg-saffron/15 text-saffron border border-saffron/30 font-bold"
                      : "text-gray-200 hover:text-saffron hover:bg-govBlue-800"
                  }`}
                >
                  <UserCircle className="w-4 h-4" />
                  <span>{(session.user as any)?.name || "Citizen"}</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  title="Sign out"
                  className="p-2 rounded-lg bg-govBlue-800 text-gray-400 hover:text-red-400 hover:bg-govBlue-700 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-200 hover:text-pureWhite transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 rounded-lg bg-saffron text-pureWhite font-bold hover:bg-saffron-dark text-xs transition shadow-gov-sm"
              >
                Register / e-KYC
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Notification & Hamburger Button */}
        <div className="md:hidden flex items-center gap-2">
          {session?.user && (
            <Link
              href="/friends"
              className="relative p-2 rounded-lg bg-govBlue-800 text-gray-200 hover:text-saffron"
            >
              <Bell className="w-5 h-5" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-saffron text-pureWhite text-[10px] font-mono font-bold flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-400 hover:text-pureWhite cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden p-4 border-t border-govBlue-800 bg-govBlue-900/95 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-200 hover:text-saffron hover:bg-govBlue-800"
            >
              <span>{link.label}</span>
              {typeof link.badge === "number" && link.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-saffron text-pureWhite text-[11px] font-mono font-bold">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
          {session?.user ? (
            <div className="pt-2 border-t border-govBlue-700 space-y-2">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-200 hover:text-saffron hover:bg-govBlue-800"
              >
                <UserCircle className="w-4 h-4" />
                <span>My Profile & Settings</span>
              </Link>
              <div className="px-3 flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {isVerified ? "Gov-ID Verified" : "Pending e-KYC"}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-xs text-red-400 hover:underline"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-govBlue-700 flex gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-xs text-gray-200 rounded bg-govBlue-800"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-xs font-bold text-pureWhite rounded bg-saffron"
              >
                Register / e-KYC
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}