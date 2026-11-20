"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";

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
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-midnight-950 overflow-hidden">
      {/* Ambient Lime Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime-neon/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-neon/5 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="relative w-full max-w-md p-8 rounded-2xl glass-panel-lime border border-lime-neon/30 shadow-2xl z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-lime-neon/15 border border-lime-neon/40 text-lime-neon shadow-neon-sm">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-pureWhite">
              TimeBank<span className="text-lime-neon">Coop</span>
            </h1>
            <p className="text-xs text-zinc-400">Egalitarian Community Exchange</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-pureWhite mb-2">Welcome Back</h2>
        <p className="text-sm text-zinc-400 mb-6">
          Sign in to access your cooperative time-credit wallet and listings.
        </p>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@coop.local"
              className="w-full px-4 py-2.5 rounded-lg bg-midnight-900 border border-zinc-800 text-pureWhite placeholder-zinc-500 focus:outline-none focus:border-lime-neon focus:ring-1 focus:ring-lime-neon text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-lg bg-midnight-900 border border-zinc-800 text-pureWhite placeholder-zinc-500 focus:outline-none focus:border-lime-neon focus:ring-1 focus:ring-lime-neon text-sm transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-lg bg-lime-neon text-midnight-950 font-bold hover:bg-lime-bright transition-all shadow-neon-sm hover:shadow-neon-md flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-midnight-950 border-t-transparent" />
            ) : (
              <>
                <span>Sign In to Wallet</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-zinc-800/80 text-center">
          <p className="text-xs text-zinc-400">
            Don't have an account yet?{" "}
            <Link
              href="/register"
              className="font-semibold text-lime-neon hover:underline inline-flex items-center gap-1"
            >
              Register here
            </Link>
          </p>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-lime-neon" />
          <span>Secured by Append-Only Cryptographic Ledger</span>
        </div>
      </div>
    </div>
  );
}
