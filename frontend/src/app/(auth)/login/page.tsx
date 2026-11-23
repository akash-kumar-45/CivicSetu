"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg("Invalid email or password. Please check your credentials.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-cream overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-saffron/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-govBlue-800/5 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="relative w-full max-w-md p-8 rounded-2xl gov-panel-blue border border-govBlue-800/30 shadow-gov-lg z-10">
        <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
          <div className="p-2.5 rounded-xl bg-saffron/15 border border-saffron/40 text-saffron shadow-saffron-sm group-hover:bg-saffron/20 transition">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-govBlue-900">
              Civic<span className="text-saffron">Setu</span>
            </h1>
            <p className="text-xs text-mutedText">Hyperlocal Work & Direct Hiring Portal</p>
          </div>
        </Link>

        <h2 className="text-2xl font-semibold text-govBlue-900 mb-2">Welcome Back</h2>
        <p className="text-sm text-mutedText mb-6">
          Sign in to post local jobs, review worker profiles, and manage active work in your ward.
        </p>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-300 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-bodyText uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="citizen@civicsetu.in"
              className="w-full px-4 py-2.5 rounded-lg bg-lightBg border border-borderLight text-darkText placeholder-mutedText focus:outline-none focus:border-govBlue-800 focus:ring-1 focus:ring-govBlue-800 text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-bodyText uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-lg bg-lightBg border border-borderLight text-darkText placeholder-mutedText focus:outline-none focus:border-govBlue-800 focus:ring-1 focus:ring-govBlue-800 text-sm transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-lg bg-saffron text-pureWhite font-bold hover:bg-saffron-dark transition-all shadow-saffron-sm hover:shadow-saffron-md flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-pureWhite border-t-transparent" />
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-borderLight text-center">
          <p className="text-xs text-mutedText">
            Don't have an account yet?{" "}
            <Link
              href="/register"
              className="font-semibold text-saffron hover:underline inline-flex items-center gap-1"
            >
              Register & verify e-KYC
            </Link>
          </p>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-mutedText">
          <ShieldCheck className="w-3.5 h-3.5 text-indiaGreen" />
          <span>e-KYC & Mutual Gov-ID Verified Portal</span>
        </div>
      </div>
    </div>
  );
}