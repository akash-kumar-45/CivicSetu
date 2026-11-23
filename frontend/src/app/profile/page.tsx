"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import {
  UserCircle,
  BadgeCheck,
  MapPin,
  Briefcase,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Mail,
  Phone,
} from "lucide-react";

const SUGGESTED_SKILLS = [
  "Plumbing",
  "Electrical Work",
  "Carpentry",
  "Home Cleaning",
  "Appliance Repair",
  "Tutoring",
  "Elder Care",
  "Tech Support",
];

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [ward, setWard] = useState("");
  const [userIntent, setUserIntent] = useState<"OWNER" | "WORKER" | "BOTH">("BOTH");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const p = data.profile;
        setProfile(p);
        setName(p.name || "");
        setWard(p.ward || "");
        setUserIntent(p.userIntent || "BOTH");
        setSkills(p.skills || []);
        setBio(p.bio || "");
      }
    } catch {
      setErrorMsg("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (!skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          ward,
          userIntent,
          skills: userIntent === "OWNER" ? [] : skills,
          bio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const details = data.details
          ? Object.values(data.details).flat().join(" • ")
          : "";
        throw new Error(details ? `${data.error}: ${details}` : data.error);
      }

      setProfile(data.profile);
      setSkills(data.profile.skills || []);
      setSuccessMsg(data.message);

      // Sync updated name, ward, userIntent, and skills into NextAuth session
      await updateSession({
        ...session,
        user: {
          ...(session?.user as any),
          name: data.profile.name,
          phone: data.profile.phone,
          ward: data.profile.ward,
          userIntent: data.profile.userIntent,
          skills: data.profile.skills,
        },
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-pureWhite text-darkText flex flex-col pt-16">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-borderLight flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron/10 border border-saffron/40 text-saffron font-mono text-xs font-bold mb-2">
              <UserCircle className="w-3.5 h-3.5" />
              <span>CivicSetu Citizen & Worker Profile</span>
            </div>
            <h1 className="text-3xl font-black text-govBlue-900">Account & e-KYC Profile</h1>
            <p className="text-xs text-mutedText mt-1">
              Update your display name, primary ward, work mode, and verified skills.
            </p>
          </div>

          {profile && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-indiaGreen font-mono text-xs font-bold">
              <BadgeCheck className="w-4 h-4" />
              <span>{profile.isVerified ? "Gov-ID e-KYC Verified" : "Pending Verification"}</span>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-indiaGreen text-xs font-semibold flex items-center gap-2 shadow-gov-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-indiaGreen" />
            <span>{successMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-mutedText">
            Loading civic profile...
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Read-Only Verified Identity Box */}
            <div className="p-5 rounded-3xl bg-lightBg border border-borderLight grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-mutedText block mb-1">
                  Registered Email (Locked)
                </span>
                <p className="text-xs font-mono font-semibold text-darkText flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-govBlue-800" />
                  {profile?.email}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-mutedText block mb-1">
                  Registered Mobile No. (Locked)
                </span>
                <p className="text-xs font-mono font-semibold text-darkText flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indiaGreen" />
                  {profile?.phone ? `+91 ${profile.phone}` : "Not Added Yet"}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-mutedText block mb-1">
                  e-KYC Document Status
                </span>
                <p className="text-xs font-mono font-semibold text-indiaGreen flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {profile?.idType || "Gov-ID"} Verified
                </p>
              </div>
            </div>

            {/* Editable Personal Information */}
            <div className="p-6 sm:p-8 rounded-3xl gov-panel border border-borderLight space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-govBlue-900 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 rounded-xl bg-lightBg border border-borderLight text-xs font-medium text-darkText focus:border-govBlue-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-govBlue-900 mb-1.5">
                    Primary Ward / Locality *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-saffron absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      placeholder="e.g. Gomti Nagar, Lucknow"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-lightBg border border-borderLight text-xs font-medium text-darkText focus:border-govBlue-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Account Mode / Intent Selector */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-govBlue-900 mb-1.5">
                  Account Role / Mode *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      value: "OWNER",
                      label: "Citizen Only",
                      desc: "Hire workers & post jobs",
                    },
                    {
                      value: "WORKER",
                      label: "Worker Only",
                      desc: "Apply for jobs & receive direct offers",
                    },
                    {
                      value: "BOTH",
                      label: "Citizen & Worker",
                      desc: "Both hire neighbors and take work",
                    },
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setUserIntent(mode.value as any)}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                        userIntent === mode.value
                          ? "border-saffron bg-saffron/10 shadow-saffron-sm"
                          : "border-borderLight bg-lightBg hover:border-govBlue-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-govBlue-900">
                        <Briefcase className="w-3.5 h-3.5 text-saffron" />
                        <span>{mode.label}</span>
                      </div>
                      <p className="text-[11px] text-mutedText mt-1">{mode.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Section (Shown when WORKER or BOTH) */}
              {(userIntent === "WORKER" || userIntent === "BOTH") && (
                <div className="p-4 rounded-2xl bg-lightBg border border-borderLight space-y-3">
                  <label className="block text-xs font-mono font-bold uppercase text-govBlue-900">
                    Public Worker Skills (Shown on your profile & Trusted Circle)
                  </label>

                  {/* Current Skills Chips */}
                  <div className="flex flex-wrap gap-2">
                    {skills.length === 0 ? (
                      <span className="text-xs text-mutedText font-mono">
                        No skills added yet. Add below so citizens know what work you do.
                      </span>
                    ) : (
                      skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pureWhite border border-govBlue-800/30 text-xs font-semibold text-govBlue-900"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-mutedText hover:text-red-500 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Add Custom Skill Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill(skillInput);
                        }
                      }}
                      placeholder="Type a skill (e.g. Plumbing, AC Repair)..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-pureWhite border border-borderLight text-xs focus:border-govBlue-800 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkill(skillInput)}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-govBlue-900 text-pureWhite text-xs font-bold hover:bg-govBlue-800 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>

                  {/* Quick Suggestions */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono text-mutedText uppercase mr-1">
                      Quick Add:
                    </span>
                    {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleAddSkill(s)}
                        className="px-2.5 py-0.5 rounded-md bg-pureWhite border border-borderLight text-[11px] text-bodyText hover:border-saffron hover:text-saffron transition cursor-pointer"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-govBlue-900 mb-1.5">
                  Short Bio / Experience Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your experience, availability hours, or neighborhood references..."
                  className="w-full px-4 py-2.5 rounded-xl bg-lightBg border border-borderLight text-xs text-darkText focus:border-govBlue-800 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-saffron text-pureWhite text-xs font-bold hover:bg-saffron-dark transition shadow-saffron-sm disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving Changes..." : "Save Profile Changes"}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}