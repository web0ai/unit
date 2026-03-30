"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* ─── Constants ──────────────────────────────────── */

const STEPS = [
  "Let's start with you",
  "Who's in your unit?",
  "What matters most?",
  "Why are you here?",
  "First goals",
  "Family theme",
  "Set your rhythm",
  "Final touches",
];

const MEMBER_TYPES = [
  { id: "partner", label: "Partner", emoji: "\u{1F491}" },
  { id: "kids", label: "Kids", emoji: "\u{1F9D2}" },
  { id: "pets", label: "Pets", emoji: "\u{1F43E}" },
  { id: "extended", label: "Extended family", emoji: "\u{1F3E1}" },
];

const PILLARS = [
  { id: "us", label: "Us", emoji: "\u{1F465}", desc: "Family identity and profiles" },
  { id: "connect", label: "Connect", emoji: "\u{1F4AC}", desc: "Check-ins, goals, communication" },
  { id: "life", label: "Life", emoji: "\u{1F30D}", desc: "Travel, bucket list, date ideas" },
  { id: "money", label: "Money", emoji: "\u{1F4B0}", desc: "Budgeting, investments, financial goals" },
  { id: "vault", label: "Vault", emoji: "\u{1F5C2}\uFE0F", desc: "Documents, passports, important files" },
];

const MOTIVATIONS = [
  { id: "connected", label: "Stay connected", emoji: "\u{1F4AC}", desc: "Better communication, regular check-ins" },
  { id: "finances", label: "Manage finances together", emoji: "\u{1F4B0}", desc: "Budgets, goals, investments" },
  { id: "plan-life", label: "Plan our life", emoji: "\u{1F30D}", desc: "Trips, bucket list, experiences" },
  { id: "organized", label: "Get organized", emoji: "\u{1F5C2}\uFE0F", desc: "Documents, schedules, important dates" },
  { id: "habits", label: "Build healthy habits", emoji: "\u{1F331}", desc: "Personal growth, routines, goals" },
  { id: "all", label: "All of the above", emoji: "\u2728", desc: "We want the full picture" },
];

const FAMILY_THEMES = [
  { id: "fruits", emoji: "\u{1F34B}", label: "Fruits", examples: "Lemon, Grape, Seedling..." },
  { id: "flowers", emoji: "\u{1F338}", label: "Flowers", examples: "Cherry blossom, Sunflower, Bud..." },
  { id: "plants", emoji: "\u{1F33F}", label: "Plants", examples: "Pothos, Cactus, Sprout..." },
  { id: "stars", emoji: "\u2B50", label: "Stars", examples: "North Star, Shooting Star, Sparkle..." },
];

const CADENCES = ["Weekly", "Biweekly", "Monthly"];

const CHECK_IN_DEPTHS = [
  { id: "short", label: "Short", time: "15 min", questions: 4 },
  { id: "medium", label: "Less Short", time: "30 min", questions: 9 },
  { id: "long", label: "Not Short", time: "60 min", questions: 15 },
];

const PRIVACY_OPTIONS = [
  { id: "full-transparency", emoji: "\u{1F91D}", label: "Full transparency", desc: "Both partners see everything" },
  { id: "shared-overview", emoji: "\u{1FAE7}", label: "Shared overview", desc: "See totals together, details stay private" },
  { id: "fully-private", emoji: "\u{1F510}", label: "Fully private", desc: "Manage separately, share goals only" },
];

const VISUAL_THEMES = [
  { id: "minimal-light", label: "Minimal Light", bg: "#FAFAF8", fg: "#1A1A1A", dot: "#DADADA" },
  { id: "minimal-dark", label: "Minimal Dark", bg: "#0F0F0F", fg: "#F5F5F0", dot: "#D4845A" },
  { id: "funky", label: "Funky & Fun", bg: "#FFF3E0", fg: "#FF6B2B", dot: "#FFB347" },
  { id: "sophisticated", label: "Sophisticated", bg: "#0D1B2A", fg: "#C9A84C", dot: "#4A7FA5" },
];

const STORAGE_KEY = "unit-onboarding-draft";

/* ─── Types ──────────────────────────────────────── */

interface OnboardingData {
  name: string;
  partnerEmail: string;
  memberTypes: string[];
  memberCount: number;
  pillars: string[];
  motivations: string[];
  sharedGoal: string;
  dreamDestination: string;
  familyTheme: string;
  cadence: string;
  checkInDepth: string;
  keyDates: { label: string; date: string }[];
  privacyMode: string;
  visualTheme: string;
}

const DEFAULT_DATA: OnboardingData = {
  name: "",
  partnerEmail: "",
  memberTypes: ["partner"],
  memberCount: 2,
  pillars: ["us", "connect", "life", "money", "vault"],
  motivations: [],
  sharedGoal: "",
  dreamDestination: "",
  familyTheme: "",
  cadence: "Weekly",
  checkInDepth: "short",
  keyDates: [],
  privacyMode: "full-transparency",
  visualTheme: "minimal-light",
};

/* ─── Main Page ──────────────────────────────────── */

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [existingUnitId, setExistingUnitId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  // Key date inputs
  const [dateLabel, setDateLabel] = useState("");
  const [dateValue, setDateValue] = useState("");

  const contentRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<OnboardingData>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...DEFAULT_DATA, ...parsed };
        }
      } catch {
        // ignore malformed storage
      }
    }
    return { ...DEFAULT_DATA };
  });

  // Persist form state to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // storage full or unavailable
    }
  }, [data]);

  // Auth check and pre-fill
  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      // Pre-fill name from Google user_metadata
      const meta = user.user_metadata;
      const googleName = meta?.full_name || meta?.name;
      if (googleName && !data.name) {
        const firstName = googleName.split(" ")[0];
        setData((d) => ({ ...d, name: firstName }));
      }

      // Check existing profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("unit_id, onboarding_completed")
        .eq("id", user.id)
        .single();

      if (profile?.onboarding_completed) {
        router.push("/dashboard");
        return;
      }

      if (profile?.unit_id) {
        setExistingUnitId(profile.unit_id);
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback(
    (patch: Partial<OnboardingData>) => setData((d) => ({ ...d, ...patch })),
    [],
  );

  function toggleArray(field: keyof OnboardingData, value: string) {
    setData((d) => {
      const arr = d[field] as string[];

      if (field === "motivations" && value === "all") {
        return { ...d, motivations: arr.includes("all") ? [] : ["all"] };
      }
      if (field === "motivations" && arr.includes("all")) {
        return { ...d, motivations: [value] };
      }

      return {
        ...d,
        [field]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : field === "motivations" && arr.length >= 3
            ? arr
            : [...arr, value],
      };
    });
  }

  function addKeyDate() {
    if (!dateLabel.trim() || !dateValue || data.keyDates.length >= 3) return;
    update({ keyDates: [...data.keyDates, { label: dateLabel.trim(), date: dateValue }] });
    setDateLabel("");
    setDateValue("");
  }

  function removeKeyDate(index: number) {
    update({ keyDates: data.keyDates.filter((_, i) => i !== index) });
  }

  // Validation per step
  function validateStep(): string | null {
    switch (step) {
      case 0:
        if (!data.name.trim()) return "Please enter your name.";
        break;
      case 2:
        if (data.pillars.length === 0) return "Please select at least one pillar.";
        break;
      case 5:
        if (!data.familyTheme) return "Please pick a family theme to continue.";
        break;
    }
    return null;
  }

  function goTo(target: number) {
    if (animating) return;

    // Only validate when going forward
    if (target > step) {
      const err = validateStep();
      if (err) {
        setError(err);
        setTimeout(() => setError(""), 4000);
        return;
      }
    }

    setError("");
    setAnimating(true);
    setTimeout(() => {
      setStep(target);
      setAnimating(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 200);
  }

  async function finish() {
    const err = validateStep();
    if (err) {
      setError(err);
      setTimeout(() => setError(""), 4000);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Check if user was invited to an existing unit
      let unitId = existingUnitId;

      if (!unitId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("unit_id")
          .eq("id", user.id)
          .single();

        unitId = profile?.unit_id ?? null;
      }

      if (!unitId) {
        // Create new unit
        const { data: unit, error: unitErr } = await supabase
          .from("units")
          .insert({
            name: `${data.name.trim()}'s Unit`,
            theme: data.familyTheme || "fruits",
            visual_theme: data.visualTheme,
            check_in_cadence: data.cadence.toLowerCase(),
            check_in_depth: data.checkInDepth,
          })
          .select("id")
          .single();

        if (unitErr) {
          setError(`Failed to create unit: ${unitErr.message}`);
          setSaving(false);
          return;
        }
        if (!unit) {
          setError("Failed to create unit. Please try again.");
          setSaving(false);
          return;
        }
        unitId = unit.id;
      }

      // Update profile
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          name: data.name.trim(),
          unit_id: unitId,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (profileErr) {
        setError(`Failed to update profile: ${profileErr.message}`);
        setSaving(false);
        return;
      }

      // Create shared goal if provided
      if (data.sharedGoal.trim()) {
        await supabase.from("goals").insert({
          unit_id: unitId,
          title: data.sharedGoal.trim(),
        });
      }

      // Create bucket list item for dream destination if provided
      if (data.dreamDestination.trim()) {
        await supabase.from("bucket_list_items").insert({
          unit_id: unitId,
          title: data.dreamDestination.trim(),
          owner: "shared",
          category: "dream",
        });
      }

      // Create key date events
      for (const kd of data.keyDates) {
        await supabase.from("events").insert({
          unit_id: unitId,
          title: kd.label,
          date: new Date(kd.date).toISOString(),
          category: "key-date",
          recurrence: "yearly",
        });
      }

      // Send partner invite if email provided and unit was just created
      if (data.partnerEmail.trim() && !existingUnitId) {
        const token = crypto.randomUUID();
        await supabase.from("invites").insert({
          unit_id: unitId,
          email: data.partnerEmail.trim(),
          token,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      // Clear localStorage draft
      localStorage.removeItem(STORAGE_KEY);

      // Show completion screen instead of redirecting
      setCompleted(true);
      setSaving(false);
    } catch (e) {
      console.error("Onboarding error:", e);
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  const isLast = step === STEPS.length - 1;

  // Loading state while checking auth
  if (!userId) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-olive border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-text text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Completion screen
  if (completed) {
    return <CompletionScreen name={data.name} data={data} onContinue={() => router.push("/dashboard")} />;
  }

  return (
    <div className="min-h-dvh flex flex-col bg-cream">
      {/* Progress bar */}
      <div className="px-6 pt-5">
        <div className="h-1 bg-border rounded-pill overflow-hidden">
          <div
            className="h-full bg-olive rounded-pill transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs font-heading font-semibold uppercase tracking-wider text-muted-text">
            {STEPS[step]}
          </span>
          <span className="text-xs text-muted-text font-light">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-6 mt-3 px-4 py-2.5 rounded-[10px] bg-destructive/10 border border-destructive/30 text-sm text-destructive animate-fade-in">
          {error}
        </div>
      )}

      {/* Step content */}
      <div ref={contentRef} className="flex-1 flex items-start justify-center px-6 py-8 overflow-y-auto">
        <div
          key={step}
          className={`w-full max-w-md ${animating ? "animate-fade-out" : "animate-fade-in"}`}
        >
          {step === 0 && <Step1 data={data} update={update} />}
          {step === 1 && <Step2 data={data} update={update} toggleArray={toggleArray} />}
          {step === 2 && <Step3 data={data} toggleArray={toggleArray} />}
          {step === 3 && <Step4 data={data} toggleArray={toggleArray} />}
          {step === 4 && <Step5 data={data} update={update} />}
          {step === 5 && <Step6 data={data} update={update} />}
          {step === 6 && (
            <Step7
              data={data}
              update={update}
              dateLabel={dateLabel}
              setDateLabel={setDateLabel}
              dateValue={dateValue}
              setDateValue={setDateValue}
              addKeyDate={addKeyDate}
              removeKeyDate={removeKeyDate}
            />
          )}
          {step === 7 && <Step8 data={data} update={update} />}
        </div>
      </div>

      {/* Footer nav */}
      <div className="sticky bottom-0 bg-cream border-t border-border/50 px-6 py-4">
        <div className="max-w-md mx-auto w-full flex gap-3">
          {step > 0 && (
            <button
              onClick={() => goTo(step - 1)}
              className="px-5 py-3.5 rounded-[10px] border-[1.5px] border-border text-muted-text font-heading text-[15px] font-medium hover:border-olive hover:text-olive transition-all duration-200"
            >
              Back
            </button>
          )}
          <button
            onClick={() => (isLast ? finish() : goTo(step + 1))}
            disabled={saving}
            className="flex-1 py-3.5 rounded-[10px] bg-olive text-cream font-heading text-[15px] font-semibold hover:bg-primary-hover hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(96,108,56,0.25)] active:translate-y-0 transition-all duration-200 disabled:opacity-50"
          >
            {saving ? "Setting up..." : isLast ? "Let's go \u2192" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Completion Screen ──────────────────────────── */

function CompletionScreen({
  name,
  data,
  onContinue,
}: {
  name: string;
  data: OnboardingData;
  onContinue: () => void;
}) {
  const summaryItems: { label: string; done: boolean }[] = [
    { label: "Profile created", done: true },
    { label: `Unit members: ${data.memberTypes.length} type${data.memberTypes.length !== 1 ? "s" : ""}, ${data.memberCount} total`, done: true },
    { label: `${data.pillars.length} pillar${data.pillars.length !== 1 ? "s" : ""} activated`, done: data.pillars.length > 0 },
    { label: `Theme: ${FAMILY_THEMES.find((t) => t.id === data.familyTheme)?.label || "None"}`, done: !!data.familyTheme },
    { label: `Check-ins: ${data.cadence}`, done: true },
    { label: "Shared goal set", done: !!data.sharedGoal.trim() },
    { label: "Dream destination added", done: !!data.dreamDestination.trim() },
    { label: `${data.keyDates.length} key date${data.keyDates.length !== 1 ? "s" : ""} saved`, done: data.keyDates.length > 0 },
    { label: data.partnerEmail ? "Partner invite ready" : "Partner invite skipped", done: !!data.partnerEmail.trim() },
  ];

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-cream px-6">
      <div className="w-full max-w-md text-center animate-fade-in">
        <div
          className="text-[56px] leading-none mb-5"
          style={{ animation: "celebrateBounce 0.6s ease-out" }}
        >
          {"\u{1F389}"}
        </div>

        <h1 className="font-heading text-[28px] md:text-[32px] font-semibold text-forest mb-2">
          {name}, you&apos;re all set!
        </h1>
        <p className="text-muted-text text-[15px] font-light mb-8">
          Your unit is ready. Here&apos;s what we configured:
        </p>

        <div className="bg-surface border-[1.5px] border-border rounded-[18px] p-5 text-left mb-8">
          <ul className="space-y-2.5">
            {summaryItems.map((item) => (
              <li key={item.label} className="flex items-center gap-3 text-sm">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.done ? "bg-olive" : "bg-border"
                  }`}
                >
                  {item.done ? (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6L5 9L10 3"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-text/40" />
                  )}
                </div>
                <span className={item.done ? "text-forest" : "text-muted-text"}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={onContinue}
          className="w-full py-3.5 rounded-[10px] bg-olive text-cream font-heading text-[15px] font-semibold hover:bg-primary-hover hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(96,108,56,0.25)] active:translate-y-0 transition-all duration-200"
        >
          Go to your dashboard {"\u2192"}
        </button>
      </div>
    </div>
  );
}

/* ─── Step Components ────────────────────────────── */

function StepHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-heading text-[26px] md:text-[30px] font-semibold text-forest">{title}</h1>
      {subtitle && (
        <p className="text-sm text-muted-text font-light mt-2 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}

/* ─── Step 1: Let's start with you ───────────────── */

function Step1({
  data,
  update,
}: {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
}) {
  return (
    <>
      <StepHeader
        title="Let's start with you."
        subtitle="Your family space begins here. Just you for now — you'll invite the rest in a moment."
      />
      <div className="space-y-4">
        <InputField
          label="First name"
          placeholder="e.g. Sarah"
          value={data.name}
          onChange={(v) => update({ name: v })}
          autoFocus
        />

        <div className="mt-6 p-4 rounded-[14px] bg-olive-light border-[1.5px] border-border">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-heading text-sm font-semibold text-forest">Invite your partner</p>
            <span className="text-[11px] text-muted-text font-light px-2 py-0.5 rounded-pill bg-cream border border-border">
              Optional
            </span>
          </div>
          <p className="text-[13px] text-muted-text font-light mb-3">
            Your space is waiting for them. You can also do this later.
          </p>
          <input
            type="email"
            placeholder="partner@example.com"
            value={data.partnerEmail}
            onChange={(e) => update({ partnerEmail: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-border bg-surface text-forest text-[15px] placeholder:text-[#b8b39a] focus:outline-none focus:border-olive focus:shadow-[0_0_0_3px_rgba(96,108,56,0.12)] transition-all duration-200"
          />
        </div>
      </div>
    </>
  );
}

/* ─── Step 2: Who's in your unit? ────────────────── */

function Step2({
  data,
  update,
  toggleArray,
}: {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
  toggleArray: (f: keyof OnboardingData, v: string) => void;
}) {
  return (
    <>
      <StepHeader
        title="Who's in your unit?"
        subtitle="Select everyone who's part of your world. You can always update this later."
      />

      {/* Pill toggle chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {MEMBER_TYPES.map((m) => (
          <button
            key={m.id}
            onClick={() => toggleArray("memberTypes", m.id)}
            className={`px-4 py-2.5 rounded-pill border-[1.5px] text-sm font-medium transition-all duration-200 ${
              data.memberTypes.includes(m.id)
                ? "bg-olive text-white border-olive"
                : "bg-surface text-muted-text border-border hover:border-olive hover:text-olive"
            }`}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      {/* Stepper for total count */}
      <div>
        <label className="block text-sm font-medium text-forest mb-2">How many people total?</label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => update({ memberCount: Math.max(1, data.memberCount - 1) })}
            disabled={data.memberCount <= 1}
            className="w-11 h-11 rounded-full border-[1.5px] border-border bg-surface text-forest text-xl font-medium flex items-center justify-center hover:border-olive hover:text-olive transition-all duration-200 disabled:opacity-30 disabled:hover:border-border disabled:hover:text-forest"
            aria-label="Decrease member count"
          >
            -
          </button>
          <span className="font-heading text-[28px] font-semibold text-forest w-12 text-center tabular-nums">
            {data.memberCount}
          </span>
          <button
            onClick={() => update({ memberCount: Math.min(20, data.memberCount + 1) })}
            disabled={data.memberCount >= 20}
            className="w-11 h-11 rounded-full border-[1.5px] border-border bg-surface text-forest text-xl font-medium flex items-center justify-center hover:border-olive hover:text-olive transition-all duration-200 disabled:opacity-30 disabled:hover:border-border disabled:hover:text-forest"
            aria-label="Increase member count"
          >
            +
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Step 3: What matters most? ─────────────────── */

function Step3({
  data,
  toggleArray,
}: {
  data: OnboardingData;
  toggleArray: (f: keyof OnboardingData, v: string) => void;
}) {
  return (
    <>
      <StepHeader
        title="What matters most?"
        subtitle="All pillars are on by default. Toggle off anything you don't need right now."
      />
      <div className="space-y-3">
        {PILLARS.map((p) => (
          <SelectCard
            key={p.id}
            selected={data.pillars.includes(p.id)}
            onClick={() => toggleArray("pillars", p.id)}
            emoji={p.emoji}
            label={p.label}
            desc={p.desc}
          />
        ))}
      </div>
    </>
  );
}

/* ─── Step 4: Why are you here? ──────────────────── */

function Step4({
  data,
  toggleArray,
}: {
  data: OnboardingData;
  toggleArray: (f: keyof OnboardingData, v: string) => void;
}) {
  const selectedCount = data.motivations.includes("all") ? "all" : data.motivations.length;
  const countLabel =
    selectedCount === "all"
      ? "All selected"
      : `${selectedCount} of 3 selected`;

  return (
    <>
      <StepHeader title="Why are you here?" />

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-heading text-[15px] font-semibold text-forest">
            What matters most right now?
          </p>
          <p className="text-[13px] text-muted-text font-light">
            Pick up to 3 — we&apos;ll personalise your experience.
          </p>
        </div>
        <span className="text-xs text-muted-text font-medium px-2.5 py-1 rounded-pill bg-olive-light border border-border whitespace-nowrap">
          {countLabel}
        </span>
      </div>

      <div className="space-y-3">
        {MOTIVATIONS.map((m) => (
          <SelectCard
            key={m.id}
            selected={data.motivations.includes(m.id)}
            onClick={() => toggleArray("motivations", m.id)}
            emoji={m.emoji}
            label={m.label}
            desc={m.desc}
          />
        ))}
      </div>
    </>
  );
}

/* ─── Step 5: First goals ────────────────────────── */

function Step5({
  data,
  update,
}: {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
}) {
  return (
    <>
      <StepHeader
        title="First goals."
        subtitle="No pressure — just a starting point. You can change these anytime."
      />
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <label className="block text-sm font-medium text-forest">Our shared goal</label>
            <span className="text-[11px] text-muted-text font-light px-2 py-0.5 rounded-pill bg-cream border border-border">
              Optional
            </span>
          </div>
          <input
            type="text"
            placeholder="e.g. Buy a home, travel more, start a business together..."
            value={data.sharedGoal}
            onChange={(e) => update({ sharedGoal: e.target.value })}
            className="w-full px-3.5 py-3 rounded-[10px] border-[1.5px] border-border bg-surface text-forest text-[15px] placeholder:text-[#b8b39a] focus:outline-none focus:border-olive focus:shadow-[0_0_0_3px_rgba(96,108,56,0.12)] transition-all duration-200"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <label className="block text-sm font-medium text-forest">A dream destination or experience</label>
            <span className="text-[11px] text-muted-text font-light px-2 py-0.5 rounded-pill bg-cream border border-border">
              Optional
            </span>
          </div>
          <input
            type="text"
            placeholder="e.g. Japan, Northern Lights, road trip across the US..."
            value={data.dreamDestination}
            onChange={(e) => update({ dreamDestination: e.target.value })}
            className="w-full px-3.5 py-3 rounded-[10px] border-[1.5px] border-border bg-surface text-forest text-[15px] placeholder:text-[#b8b39a] focus:outline-none focus:border-olive focus:shadow-[0_0_0_3px_rgba(96,108,56,0.12)] transition-all duration-200"
          />
        </div>
      </div>

      <p className="mt-5 text-[13px] text-muted-text font-light text-center">
        Both are optional — just hit Continue to skip.
      </p>
    </>
  );
}

/* ─── Step 6: Family theme ───────────────────────── */

function Step6({
  data,
  update,
}: {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
}) {
  return (
    <>
      <StepHeader
        title="Family theme."
        subtitle="Every member of your unit gets a character. Pick the theme that fits your vibe."
      />
      <div className="grid grid-cols-2 gap-3 md:gap-3.5">
        {FAMILY_THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => update({ familyTheme: t.id })}
            className={`relative p-5 pt-6 rounded-[14px] border-2 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] ${
              data.familyTheme === t.id
                ? "border-olive bg-olive-light shadow-[0_0_0_3px_rgba(96,108,56,0.2)]"
                : "border-border bg-surface hover:border-olive"
            }`}
          >
            {data.familyTheme === t.id && (
              <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-olive flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6L5 9L10 3"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
            <span className="text-4xl">{t.emoji}</span>
            <p className="font-heading text-sm font-semibold text-forest mt-2">{t.label}</p>
            <p className="text-[11px] text-muted-text font-light mt-0.5 leading-snug">{t.examples}</p>
          </button>
        ))}
      </div>
      {!data.familyTheme && (
        <p className="mt-4 text-[13px] text-muted-text text-center font-light">
          Pick a theme to continue
        </p>
      )}
    </>
  );
}

/* ─── Step 7: Set your rhythm ────────────────────── */

function Step7({
  data,
  update,
  dateLabel,
  setDateLabel,
  dateValue,
  setDateValue,
  addKeyDate,
  removeKeyDate,
}: {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
  dateLabel: string;
  setDateLabel: (v: string) => void;
  dateValue: string;
  setDateValue: (v: string) => void;
  addKeyDate: () => void;
  removeKeyDate: (i: number) => void;
}) {
  return (
    <>
      <StepHeader
        title="Set your rhythm."
        subtitle="Consistent check-ins are the backbone of a strong family system."
      />

      {/* Cadence pills */}
      <p className="font-heading text-[15px] font-semibold text-forest mb-3">
        How often do you want a couple check-in?
      </p>
      <div className="grid grid-cols-3 gap-2 mb-6">
        {CADENCES.map((c) => (
          <button
            key={c}
            onClick={() => update({ cadence: c })}
            className={`py-2.5 rounded-pill border-[1.5px] text-sm font-medium text-center transition-all duration-200 ${
              data.cadence === c
                ? "bg-olive text-white border-olive"
                : "bg-surface text-muted-text border-border hover:border-olive hover:text-olive"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Check-in depth cards */}
      <p className="font-heading text-[15px] font-semibold text-forest mb-3">How deep should each check-in be?</p>
      <div className="space-y-2.5 mb-6">
        {CHECK_IN_DEPTHS.map((d) => (
          <button
            key={d.id}
            onClick={() => update({ checkInDepth: d.id })}
            className={`w-full flex items-center justify-between p-3.5 rounded-[14px] border-[1.5px] text-left transition-all duration-200 hover:-translate-y-px hover:shadow-[0_3px_12px_rgba(96,108,56,0.08)] ${
              data.checkInDepth === d.id
                ? "border-olive bg-olive-light"
                : "border-border bg-surface hover:border-olive"
            }`}
          >
            <div>
              <p className="font-heading text-sm font-semibold text-forest">{d.label}</p>
              <p className="text-[13px] text-muted-text font-light">
                {d.time}, {d.questions} questions
              </p>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 ${
                data.checkInDepth === d.id ? "border-olive bg-olive" : "border-border"
              }`}
            >
              {data.checkInDepth === d.id && (
                <div className="w-[7px] h-[7px] rounded-full bg-white" />
              )}
            </div>
          </button>
        ))}
      </div>

      <hr className="border-border my-6" />

      {/* Key dates */}
      <p className="font-heading text-sm font-semibold text-forest">Key dates to remember</p>
      <p className="text-[13px] text-muted-text font-light mt-0.5 mb-3">
        Birthdays, anniversaries, things that matter. Max 3. (Optional)
      </p>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="e.g. Anniversary"
          value={dateLabel}
          onChange={(e) => setDateLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addKeyDate()}
          className="flex-1 px-3 py-2.5 rounded-[10px] border-[1.5px] border-border bg-surface text-forest text-sm placeholder:text-[#b8b39a] focus:outline-none focus:border-olive focus:shadow-[0_0_0_3px_rgba(96,108,56,0.12)] transition-all duration-200"
        />
        <input
          type="date"
          value={dateValue}
          onChange={(e) => setDateValue(e.target.value)}
          className="flex-[1.1] px-3 py-2.5 rounded-[10px] border-[1.5px] border-border bg-surface text-forest text-sm focus:outline-none focus:border-olive focus:shadow-[0_0_0_3px_rgba(96,108,56,0.12)] transition-all duration-200"
        />
        <button
          onClick={addKeyDate}
          disabled={!dateLabel.trim() || !dateValue || data.keyDates.length >= 3}
          className="px-3.5 rounded-[10px] bg-olive text-white text-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-30"
          aria-label="Add key date"
        >
          +
        </button>
      </div>

      {data.keyDates.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.keyDates.map((kd, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-olive-light border-[1.5px] border-border text-[13px] text-forest"
            >
              {kd.label} &mdash;{" "}
              {new Date(kd.date + "T00:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              <button
                onClick={() => removeKeyDate(i)}
                className="ml-0.5 text-muted-text hover:text-terra transition-colors text-base leading-none"
                aria-label={`Remove ${kd.label}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </>
  );
}

/* ─── Step 8: Final touches ──────────────────────── */

function Step8({
  data,
  update,
}: {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
}) {
  return (
    <>
      <StepHeader
        title="Final touches."
        subtitle="Almost there — two more settings to make this space feel right."
      />

      {/* Money privacy — radio cards */}
      <p className="font-heading text-[15px] font-semibold text-forest mb-3">
        How would you like to handle finances?
      </p>
      <div className="space-y-3 mb-6">
        {PRIVACY_OPTIONS.map((o) => (
          <button
            key={o.id}
            onClick={() => update({ privacyMode: o.id })}
            className={`w-full flex items-center gap-3.5 p-3.5 rounded-[14px] border-[1.5px] text-left transition-all duration-200 hover:-translate-y-px hover:shadow-[0_3px_12px_rgba(96,108,56,0.08)] ${
              data.privacyMode === o.id
                ? "border-olive bg-olive-light"
                : "border-border bg-surface hover:border-olive"
            }`}
          >
            <span className="text-[22px]">{o.emoji}</span>
            <div className="flex-1">
              <p className="font-heading text-sm font-semibold text-forest">{o.label}</p>
              <p className="text-[13px] text-muted-text font-light">{o.desc}</p>
            </div>
            <div
              className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 ${
                data.privacyMode === o.id ? "border-olive bg-olive" : "border-border"
              }`}
            >
              {data.privacyMode === o.id && (
                <div className="w-[7px] h-[7px] rounded-full bg-white" />
              )}
            </div>
          </button>
        ))}
      </div>

      <hr className="border-border my-6" />

      {/* Visual theme — 2x2 preview cards */}
      <p className="font-heading text-[15px] font-semibold text-forest mb-3">
        How should your space look?
      </p>
      <div className="grid grid-cols-2 gap-3">
        {VISUAL_THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => update({ visualTheme: t.id })}
            className={`relative rounded-[14px] border-2 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] ${
              data.visualTheme === t.id
                ? "border-olive shadow-[0_0_0_3px_rgba(96,108,56,0.2)]"
                : "border-border hover:border-olive"
            }`}
          >
            {data.visualTheme === t.id && (
              <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-olive flex items-center justify-center">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6L5 9L10 3"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
            <div
              className="h-[90px] md:h-[100px] p-3 flex flex-col justify-between"
              style={{ backgroundColor: t.bg }}
            >
              <div className="h-1.5 rounded-full w-[60%]" style={{ backgroundColor: t.fg }} />
              <div className="space-y-1">
                <div className="h-1 rounded-full w-[70%] opacity-40" style={{ backgroundColor: t.fg }} />
                <div className="h-1 rounded-full w-[40%] opacity-40" style={{ backgroundColor: t.fg }} />
              </div>
              <div className="w-[18px] h-[18px] rounded-full self-end" style={{ backgroundColor: t.dot }} />
            </div>
            <div className="px-3 py-2 bg-surface">
              <p className="text-xs font-medium text-forest">{t.label}</p>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

/* ─── Shared Components ──────────────────────────── */

function InputField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  autoFocus = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-forest mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        className="w-full px-3.5 py-3 rounded-[10px] border-[1.5px] border-border bg-surface text-forest text-[15px] placeholder:text-[#b8b39a] focus:outline-none focus:border-olive focus:shadow-[0_0_0_3px_rgba(96,108,56,0.12)] transition-all duration-200"
      />
    </div>
  );
}

function SelectCard({
  selected,
  onClick,
  emoji,
  label,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 p-3.5 rounded-[14px] border-[1.5px] text-left transition-all duration-200 hover:-translate-y-px hover:shadow-[0_3px_12px_rgba(96,108,56,0.08)] ${
        selected
          ? "border-olive bg-olive-light"
          : "border-border bg-surface hover:border-olive"
      }`}
    >
      <span className="text-[22px]">{emoji}</span>
      <div className="flex-1">
        <p className="font-heading text-sm font-semibold text-forest">{label}</p>
        <p className="text-[13px] text-muted-text font-light">{desc}</p>
      </div>
      <div
        className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 ${
          selected ? "border-olive bg-olive" : "border-border"
        }`}
      >
        {selected && (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6L5 9L10 3"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </button>
  );
}
