"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  BadgeCheck,
  MapPin,
  Briefcase,
  UserCheck,
  Phone,
} from "lucide-react";

const SKILL_OPTIONS = [
  "Electrician",
  "Plumbing",
  "House Cleaning",
  "Shifting & Lifting",
  "Home Tutoring",
  "Appliance Repair",
  "Gardening",
  "Errands & Delivery",
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [userIntent, setUserIntent] = useState<"OWNER" | "WORKER" | "BOTH">("BOTH");
  const [ward, setWard] = useState("");
  const [idType, setIdType] = useState<"AADHAAR" | "VOTER_ID" | "DIGILOCKER">("DIGILOCKER");
  const [govIdNumber, setGovIdNumber] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "owner") setUserIntent("OWNER");
    else if (roleParam === "worker") setUserIntent("WORKER");
  }, [searchParams]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setErrorMsg("Please enter a valid 10-digit active Indian mobile number.");
      setLoading(false);
      return;
    }

    if (govIdNumber.trim().length < 6) {
      setErrorMsg("Please enter a valid Gov-ID / DigiLocker reference number for e-KYC verification.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          role: "MEMBER", // Preserves existing backend enum compatibility
          userIntent,
          ward,
          idType,
          govIdNumber,
          skills: selectedSkills,
          bio,
          isVerified: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const fieldMessages = data.details
          ? Object.values(data.details).flat().join(" • ")
          : "";
        setErrorMsg(
          fieldMessages ? `${data.error}: ${fieldMessages}` : data.error || "Failed to create civic profile"
        );
      } else {
        setSuccessMsg("Gov-ID e-KYC verified & account created! Redirecting to sign in...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showWorkerFields = userIntent === "WORKER" || userIntent === "BOTH";

  return (
    <div className="relative w-full max-w-lg p-8 rounded-2xl gov-panel-blue border border-govBlue-800/30 shadow-gov-lg z-10 my-8">
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

      <h2 className="text-2xl font-semibold text-govBlue-900 mb-1">Citizen & Worker Registration</h2>
      <p className="text-sm text-mutedText mb-6">
        Verify your civic identity to hire local help or get matched with jobs in your ward.
      </p>

      {errorMsg && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-300 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-indiaGreen" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Role Selection */}
        <div>
          <label className="block text-xs font-medium text-bodyText uppercase tracking-wider mb-1.5">
            How will you use CivicSetu?
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setUserIntent("OWNER")}
              className={`py-2.5 px-2 rounded-lg text-xs font-semibold border transition flex flex-col items-center gap-1 cursor-pointer ${
                userIntent === "OWNER"
                  ? "bg-saffron/15 border-saffron text-saffron shadow-saffron-sm"
                  : "bg-lightBg border-borderLight text-mutedText hover:text-darkText"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Hire Help</span>
            </button>
            <button
              type="button"
              onClick={() => setUserIntent("WORKER")}
              className={`py-2.5 px-2 rounded-lg text-xs font-semibold border transition flex flex-col items-center gap-1 cursor-pointer ${
                userIntent === "WORKER"
                  ? "bg-saffron/15 border-saffron text-saffron shadow-saffron-sm"
                  : "bg-lightBg border-borderLight text-mutedText hover:text-darkText"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Find Work</span>
            </button>
            <button
              type="button"
              onClick={() => setUserIntent("BOTH")}
              className={`py-2.5 px-2 rounded-lg text-xs font-semibold border transition flex flex-col items-center gap-1 cursor-pointer ${
                userIntent === "BOTH"
                  ? "bg-saffron/15 border-saffron text-saffron shadow-saffron-sm"
                  : "bg-lightBg border-borderLight text-mutedText hover:text-darkText"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Both</span>
            </button>
          </div>
        </div>

        {/* Basic Credentials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-bodyText uppercase tracking-wider mb-1.5">
              Full Name (As per ID) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rohan Verma"
              className="w-full px-3.5 py-2.5 rounded-lg bg-lightBg border border-borderLight text-darkText placeholder-mutedText focus:outline-none focus:border-govBlue-800 focus:ring-1 focus:ring-govBlue-800 text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-bodyText uppercase tracking-wider mb-1.5">
              Local Ward / Area *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-saffron absolute left-3 top-3" />
              <input
                type="text"
                required
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                placeholder="e.g. Gomti Nagar, Ward 14"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-lightBg border border-borderLight text-darkText placeholder-mutedText focus:outline-none focus:border-govBlue-800 focus:ring-1 focus:ring-govBlue-800 text-sm transition"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-bodyText uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rohan@civicsetu.in"
              className="w-full px-3.5 py-2.5 rounded-lg bg-lightBg border border-borderLight text-darkText placeholder-mutedText focus:outline-none focus:border-govBlue-800 focus:ring-1 focus:ring-govBlue-800 text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-bodyText uppercase tracking-wider mb-1.5">
              Active Mobile No. *
            </label>
            <div className="relative flex items-center">
              <Phone className="w-3.5 h-3.5 text-indiaGreen absolute left-3" />
              <span className="pl-8 pr-2 text-xs font-mono font-bold text-mutedText select-none">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                pattern="[6-9][0-9]{9}"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                className="w-full pr-3.5 py-2.5 rounded-lg bg-lightBg border border-borderLight text-darkText placeholder-mutedText focus:outline-none focus:border-govBlue-800 focus:ring-1 focus:ring-govBlue-800 text-sm font-mono transition"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-bodyText uppercase tracking-wider mb-1.5">
            Password (Min 8 chars) *
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full px-3.5 py-2.5 rounded-lg bg-lightBg border border-borderLight text-darkText placeholder-mutedText focus:outline-none focus:border-govBlue-800 focus:ring-1 focus:ring-govBlue-800 text-sm transition"
          />
        </div>

        {/* Mutual Gov-ID Verification Box */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-300/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-govBlue-900 flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-indiaGreen" />
              MUTUAL GOV-ID e-KYC VERIFICATION
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 font-bold">
              DigiLocker Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={idType}
              onChange={(e) => setIdType(e.target.value as any)}
              className="px-3 py-2 rounded-lg bg-pureWhite border border-emerald-200 text-xs font-medium text-darkText focus:outline-none focus:border-indiaGreen"
            >
              <option value="DIGILOCKER">DigiLocker ID</option>
              <option value="AADHAAR">Aadhaar (Last 4 / Mock)</option>
              <option value="VOTER_ID">Voter ID (EPIC)</option>
            </select>

            <input
              type="text"
              required
              value={govIdNumber}
              onChange={(e) => setGovIdNumber(e.target.value)}
              placeholder="Enter ID / Demo Ref (e.g. DL-908214)"
              className="sm:col-span-2 px-3 py-2 rounded-lg bg-pureWhite border border-emerald-200 text-xs text-darkText placeholder-mutedText focus:outline-none focus:border-indiaGreen"
            />
          </div>
          <p className="text-[11px] text-mutedText leading-snug">
            Required for both job posters and workers to prevent fake addresses and ensure safe home visits.
          </p>
        </div>

        {/* Worker Public Profile Fields (Conditional) */}
        {showWorkerFields && (
          <div className="p-4 rounded-xl bg-lightBg border border-borderLight space-y-3">
            <label className="block text-xs font-mono font-bold text-govBlue-900 uppercase tracking-wider">
              Public Worker Skills (Visible to Job Posters)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SKILL_OPTIONS.map((skill) => {
                const active = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition cursor-pointer ${
                      active
                        ? "bg-saffron text-pureWhite border-saffron font-semibold"
                        : "bg-pureWhite text-bodyText border-borderLight hover:border-saffron/60"
                    }`}
                  >
                    {active ? `✓ ${skill}` : `+ ${skill}`}
                  </button>
                );
              })}
            </div>

            <div>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Short public bio (e.g., 5 yrs experience in home electrical & fan repair)"
                className="w-full px-3 py-2 rounded-lg bg-pureWhite border border-borderLight text-xs text-darkText placeholder-mutedText focus:outline-none focus:border-govBlue-800"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-lg bg-saffron text-pureWhite font-bold hover:bg-saffron-dark transition-all shadow-saffron-sm hover:shadow-saffron-md flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-pureWhite border-t-transparent" />
          ) : (
            <>
              <span>Verify e-KYC & Create Profile</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-borderLight text-center">
        <p className="text-xs text-mutedText">
          Already have a verified account?{" "}
          <Link
            href="/login"
            className="font-semibold text-saffron hover:underline inline-flex items-center gap-1"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-mutedText">
        <ShieldCheck className="w-3.5 h-3.5 text-indiaGreen" />
        <span>₹0 Commission • Two-Stage Address Privacy • Mutual Ratings</span>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-cream overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-saffron/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-govBlue-800/5 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={<div className="text-xs font-mono text-mutedText">Loading civic registration...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}