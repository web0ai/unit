"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const STEPS = [
  "Let's start with you",
  "Who's in your unit?",
  "What matters most?",
  "Why are you here?",
  "First goals",
  "Choose your family theme",
  "Set your rhythm",
  "A couple more things",
];

const MEMBER_TYPES = [
  { id: "partner", label: "Partner", emoji: "💑" },
  { id: "kids", label: "Kids", emoji: "🧒" },
  { id: "pets", label: "Pets", emoji: "🐾" },
  { id: "extended", label: "Extended family", emoji: "🏡" },
];

const PILLARS = [
  { id: "us", label: "Us", emoji: "👥", desc: "Family identity and profiles" },
  { id: "connect", label: "Connect", emoji: "💬", desc: "Check-ins, goals, communication" },
  { id: "life", label: "Life", emoji: "🌍", desc: "Travel, bucket list, date ideas" },
  { id: "money", label: "Money", emoji: "💰", desc: "Budgeting, investments, financial goals" },
  { id: "vault", label: "Vault", emoji: "🗂️", desc: "Documents, passports, important files" },
];

const MOTIVATIONS = [
  { id: "connected", label: "Stay connected", emoji: "💬", desc: "Better communication, regular check-ins" },
  { id: "finances", label: "Manage finances together", emoji: "💰", desc: "Budgets, goals, investments" },
  { id: "plan-life", label: "Plan our life", emoji: "🌍", desc: "Trips, bucket list, experiences" },
  { id: "organized", label: "Get organized", emoji: "🗂️", desc: "Documents, schedules, important dates" },
  { id: "habits", label: "Build healthy habits", emoji: "🌱", desc: "Personal growth, routines, goals" },
  { id: "all", label: "All of the above", emoji: "✨", desc: "We want the full picture" },
];

const FAMILY_THEMES = [
  { id: "fruits", emoji: "🍋", label: "Fruits", examples: "Lemon, Grape, Seedling..." },
  { id: "flowers", emoji: "🌸", label: "Flowers", examples: "Cherry blossom, Sunflower, Bud..." },
  { id: "plants", emoji: "🌿", label: "Plants", examples: "Pothos, Cactus, Sprout..." },
  { id: "stars", emoji: "⭐", label: "Stars", examples: "North Star, Shooting Star, Sparkle..." },
];

const CADENCES = ["Weekly", "Biweekly", "Monthly"];

const PRIVACY_OPTIONS = [
  { id: "full-transparency", emoji: "🤝", label: "Full transparency", desc: "Both partners see everything" },
  { id: "shared-overview", emoji: "🫧", label: "Shared overview", desc: "See totals together, details stay private" },
  { id: "fully-private", emoji: "🔐", label: "Fully private", desc: "Manage separately, share goals only" },
];

const VISUAL_THEMES = [
  { id: "minimal-light", label: "Minimal Light", bg: "#FAFAF8", fg: "#1A1A1A", dot: "#DADADA" },
  { id: "minimal-dark", label: "Minimal Dark", bg: "#0F0F0F", fg: "#F5F5F0", dot: "#D4845A" },
  { id: "funky", label: "Funky & Fun", bg: "#FFF3E0", fg: "#FF6B2B", dot: "#FFB347" },
  { id: "sophisticated", label: "Sophisticated", bg: "#0D1B2A", fg: "#C9A84C", dot: "#4A7FA5" },
];

interface OnboardingData {
  name: string;
  partnerEmail: string;
  memberTypes: string[];
  memberCount: string;
  pillars: string[];
  motivations: string[];
  sharedGoal: string;
  dreamDestination: string;
  familyTheme: string;
  cadence: string;
  keyDates: { label: string; date: string }[];
  privacyMode: string;
  visualTheme: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const [data, setData] = useState<OnboardingData>({
    name: "",
    partnerEmail: "",
    memberTypes: ["partner"],
    memberCount: "2",
    pillars: ["us", "connect", "life", "money", "vault"],
    motivations: [],
    sharedGoal: "",
    dreamDestination: "",
    familyTheme: "",
    cadence: "Weekly",
    keyDates: [],
    privacyMode: "full-transparency",
    visualTheme: "minimal-light",
  });

  // Check auth on mount and pre-fill email user's name if available
  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);

      // Pre-fill name from Google profile if available
      const meta = user.user_metadata;
      if (meta?.full_name && !data.name) {
        const firstName = meta.full_name.split(" ")[0];
        setData((d) => ({ ...d, name: firstName }));
      } else if (meta?.name && !data.name) {
        const firstName = meta.name.split(" ")[0];
        setData((d) => ({ ...d, name: firstName }));
      }

      // Check if user already has a unit (invited partner)
      const { data: profile } = await supabase
        .from("profiles")
        .select("unit_id, onboarding_completed")
        .eq("id", user.id)
        .single();

      if (profile?.onboarding_completed) {
        router.push("/dashboard");
        return;
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback(
    (patch: Partial<OnboardingData>) => setData((d) => ({ ...d, ...patch })),
    []
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
    if (!dateLabel || !dateValue || data.keyDates.length >= 3) return;
    update({ keyDates: [...data.keyDates, { label: dateLabel, date: dateValue }] });
    setDateLabel("");
    setDateValue("");
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
        if (!data.familyTheme) return "Please pick a family theme.";
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
        setTimeout(() => setError(""), 3000);
        return;
      }
    }

    setError("");
    setAnimating(true);
    setTimeout(() => {
      setStep(target);
      setAnimating(false);
      // Scroll to top on step change
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 200);
  }

  async function finish() {
    const err = validateStep();
    if (err) {
      setError(err);
      setTimeout(() => setError(""), 3000);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Check if user was invited to an existing unit
      const { data: profile } = await supabase
        .from("profiles")
        .select("unit_id")
        .eq("id", user.id)
        .single();

      let unitId = profile?.unit_id;

      if (!unitId) {
        // Create new unit
        const { data: unit, error: unitErr } = await supabase
          .from("units")
          .insert({
            name: `${data.name.trim()}'s Unit`,
            theme: data.familyTheme || "fruits",
            visual_theme: data.visualTheme,
            check_in_cadence: data.cadence.toLowerCase(),
            check_in_depth: "short",
          })
          .select("id")
          .single();

        if (unitErr) {
          console.error("Unit creation error:", unitErr);
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
        console.error("Profile update error:", profileErr);
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
      if (data.partnerEmail.trim() && !profile?.unit_id) {
        const token = crypto.randomUUID();
        await supabase.from("invites").insert({
          unit_id: unitId,
          email: data.partnerEmail.trim(),
          token,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
        // TODO: send email via edge function or API
      }

      router.push("/dashboard");
    } catch (e) {
      console.error("Onboarding error:", e);
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  const isLast = step === STEPS.length - 1;

  // Don't render until we've checked auth
  if (!userId) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-cream">
        <p className="text-muted-text text-sm">Loading...</p>
      </div>
    );
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
      <div className="flex-1 flex items-start justify-center px-6 py-8 overflow-y-auto">
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
            {saving ? "Setting up..." : isLast ? "Let's go →" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Step Components ──────────────────────────── */

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-heading text-[26px] md:text-[30px] font-semibold text-forest">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-muted-text font-light mt-2 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Step1({ data, update }: { data: OnboardingData; update: (p: Partial<OnboardingData>) => void }) {
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
        <div className="mt-6 p-4 rounded-xl bg-olive-light border-[1.5px] border-border">
          <p className="font-heading text-sm font-semibold text-forest">
            Invite your partner
          </p>
          <p className="text-[13px] text-muted-text font-light mt-0.5 mb-3">
            Your space is waiting for them. (Optional — you can do this later)
          </p>
          <input
            type="email"
            placeholder="partner@example.com"
            value={data.partnerEmail}
            onChange={(e) => update({ partnerEmail: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-border bg-surface text-forest text-[15px] placeholder:text-[#b8b39a] focus:outline-none focus:border-olive focus:shadow-[0_0_0_3px_rgba(96,108,56,0.12)] transition-all duration-200"
          />
        </div>
      </div>
    </>
  );
}

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
      <InputField
        label="How many people total?"
        placeholder="e.g. 4"
        type="number"
        value={data.memberCount}
        onChange={(v) => update({ memberCount: v })}
      />
    </>
  );
}

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
        subtitle="Pick the pillars you want to start with. You can add more later."
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

function Step4({
  data,
  toggleArray,
}: {
  data: OnboardingData;
  toggleArray: (f: keyof OnboardingData, v: string) => void;
}) {
  return (
    <>
      <StepHeader
        title="Why are you here?"
        subtitle=""
      />
      <div className="p-4 rounded-xl bg-olive-light border-[1.5px] border-border mb-6">
        <p className="text-sm text-forest leading-relaxed">
          Unit is your couple&apos;s operating system — one place to stay connected,
          manage your life together, and grow as a team.
        </p>
      </div>
      <p className="font-heading text-[15px] font-semibold text-forest mb-1">
        What matters most to you right now?
      </p>
      <p className="text-[13px] text-muted-text font-light mb-4">
        Pick up to 3 — we&apos;ll personalise your experience around these.
      </p>
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

function Step5({ data, update }: { data: OnboardingData; update: (p: Partial<OnboardingData>) => void }) {
  return (
    <>
      <StepHeader
        title="Let's start with something real."
        subtitle="No pressure — these are just for you. You can always update them later."
      />
      <div className="space-y-4">
        <InputField
          label="Our shared goal"
          placeholder="e.g. Buy a home, travel more, start a business together..."
          value={data.sharedGoal}
          onChange={(v) => update({ sharedGoal: v })}
        />
        <InputField
          label="A dream destination or experience"
          placeholder="e.g. Japan, Northern Lights, road trip across the US..."
          value={data.dreamDestination}
          onChange={(v) => update({ dreamDestination: v })}
        />
      </div>
      <p className="mt-4 text-[13px] text-muted-text font-light">
        Both fields are optional — just hit Continue to skip.
      </p>
    </>
  );
}

function Step6({ data, update }: { data: OnboardingData; update: (p: Partial<OnboardingData>) => void }) {
  return (
    <>
      <StepHeader
        title="Choose your family theme."
        subtitle="Every member of your unit gets a character. Pick the theme that fits your vibe."
      />
      <div className="grid grid-cols-2 gap-3 md:gap-3.5">
        {FAMILY_THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => update({ familyTheme: t.id })}
            className={`relative p-5 pt-6 rounded-2xl border-2 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] ${
              data.familyTheme === t.id
                ? "border-olive bg-olive-light shadow-[0_0_0_3px_rgba(96,108,56,0.2)]"
                : "border-border bg-surface hover:border-olive"
            }`}
          >
            {data.familyTheme === t.id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-olive flex items-center justify-center">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            <span className="text-4xl">{t.emoji}</span>
            <p className="font-heading text-sm font-semibold text-forest mt-2">
              {t.label}
            </p>
            <p className="text-[11px] text-muted-text font-light mt-0.5 leading-snug">
              {t.examples}
            </p>
          </button>
        ))}
      </div>
    </>
  );
}

function Step7({
  data,
  update,
  dateLabel,
  setDateLabel,
  dateValue,
  setDateValue,
  addKeyDate,
}: {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
  dateLabel: string;
  setDateLabel: (v: string) => void;
  dateValue: string;
  setDateValue: (v: string) => void;
  addKeyDate: () => void;
}) {
  return (
    <>
      <StepHeader
        title="Set your rhythm."
        subtitle="Consistent check-ins are the backbone of a strong family system."
      />

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

      <hr className="border-border my-6" />

      <p className="font-heading text-sm font-semibold text-forest">
        Key dates to remember
      </p>
      <p className="text-[13px] text-muted-text font-light mt-0.5 mb-3">
        Birthdays, anniversaries, things that matter — never miss them again. (Optional)
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
          className="px-3.5 rounded-lg bg-olive text-white text-lg hover:bg-primary-hover transition-colors"
        >
          +
        </button>
      </div>

      {data.keyDates.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.keyDates.map((kd, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-pill bg-olive-light border-[1.5px] border-border text-[13px]"
            >
              {kd.label} —{" "}
              {new Date(kd.date + "T00:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              <button
                onClick={() =>
                  update({ keyDates: data.keyDates.filter((_, j) => j !== i) })
                }
                className="ml-1 text-muted-text hover:text-terra transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </>
  );
}

function Step8({ data, update }: { data: OnboardingData; update: (p: Partial<OnboardingData>) => void }) {
  return (
    <>
      <StepHeader
        title="A couple more things."
        subtitle="Almost there — just two final touches to make this space feel right."
      />

      <p className="font-heading text-[15px] font-semibold text-forest mb-3">
        How would you like to handle finances?
      </p>
      <div className="space-y-3 mb-6">
        {PRIVACY_OPTIONS.map((o) => (
          <button
            key={o.id}
            onClick={() => update({ privacyMode: o.id })}
            className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border-[1.5px] text-left transition-all duration-200 hover:-translate-y-px hover:shadow-[0_3px_12px_rgba(96,108,56,0.08)] ${
              data.privacyMode === o.id
                ? "border-olive bg-olive-light"
                : "border-border bg-surface hover:border-olive"
            }`}
          >
            <span className="text-[22px]">{o.emoji}</span>
            <div className="flex-1">
              <p className="font-heading text-sm font-semibold text-forest">
                {o.label}
              </p>
              <p className="text-[13px] text-muted-text font-light">{o.desc}</p>
            </div>
            <div
              className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 ${
                data.privacyMode === o.id
                  ? "border-olive bg-olive"
                  : "border-border"
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
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            <div
              className="h-[90px] md:h-[100px] p-3 flex flex-col justify-between"
              style={{ backgroundColor: t.bg }}
            >
              <div
                className="h-1.5 rounded-full w-[60%]"
                style={{ backgroundColor: t.fg }}
              />
              <div className="space-y-1">
                <div
                  className="h-1 rounded-full w-[70%] opacity-40"
                  style={{ backgroundColor: t.fg }}
                />
                <div
                  className="h-1 rounded-full w-[40%] opacity-40"
                  style={{ backgroundColor: t.fg }}
                />
              </div>
              <div
                className="w-[18px] h-[18px] rounded-full self-end"
                style={{ backgroundColor: t.dot }}
              />
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

/* ─── Shared Components ────────────────────────── */

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
      <label className="block text-sm font-medium text-forest mb-1.5">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        min={type === "number" ? 1 : undefined}
        max={type === "number" ? 20 : undefined}
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
      className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border-[1.5px] text-left transition-all duration-200 hover:-translate-y-px hover:shadow-[0_3px_12px_rgba(96,108,56,0.08)] ${
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
            <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </button>
  );
}
