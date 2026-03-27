"use client";

import { useState } from "react";
import Link from "next/link";
import { useUnit } from "@/hooks/use-unit";
import { useCheckIns } from "@/hooks/use-checkins";

const DEPTHS = [
  { id: "short", label: "Short", meta: "15 min · 4 questions" },
  { id: "less-short", label: "Less Short", meta: "30 min · 9 questions" },
  { id: "not-short", label: "Not Short", meta: "60 min · 15 questions" },
];

export default function ConnectPage() {
  const { unit, updateUnit } = useUnit();
  const { checkIns, createCheckIn } = useCheckIns();
  const [showSettings, setShowSettings] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const cadence = unit?.check_in_cadence || "weekly";
  const depth = unit?.check_in_depth || "short";
  const activeCheckIn = checkIns.find((c) => c.status === "in_progress");
  const completedCheckIns = checkIns.filter((c) => c.status === "completed");

  async function startCheckIn() {
    setStarting(true);
    const ci = await createCheckIn(cadence, depth);
    if (ci) {
      window.location.href = `/connect/check-in?id=${ci.id}`;
    }
    setStarting(false);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-[26px] font-semibold text-forest">Connect</h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-3 py-1.5 rounded-lg text-xs text-olive border border-olive/30 hover:bg-olive-light transition-all"
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest/35" onClick={() => setShowSettings(false)}>
          <div
            className="bg-surface border border-border rounded-[18px] p-8 max-w-lg w-full mx-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-heading text-lg font-semibold text-forest">⚙️ Check-in Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-muted-text hover:text-forest text-xl">×</button>
            </div>
            <p className="text-xs text-muted-text mb-6">Configure your cadence and depth preference.</p>

            <div className="mb-6">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-text mb-2 block">Cadence</label>
              <div className="flex gap-2">
                {["weekly", "biweekly", "monthly"].map((c) => (
                  <button
                    key={c}
                    onClick={() => updateUnit({ check_in_cadence: c })}
                    className={`flex-1 py-2 rounded-pill border-[1.5px] text-sm font-medium text-center capitalize transition-all ${
                      cadence === c
                        ? "bg-olive text-white border-olive"
                        : "bg-cream text-muted-text border-border hover:border-olive"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-text mb-2 block">Check-in depth</label>
              <div className="flex gap-2 flex-wrap">
                {DEPTHS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => updateUnit({ check_in_depth: d.id })}
                    className={`px-4 py-2.5 rounded-[10px] border-[1.5px] transition-all ${
                      depth === d.id
                        ? "border-olive bg-olive-light shadow-[0_0_0_3px_rgba(96,108,56,0.12)]"
                        : "border-border bg-cream hover:border-olive hover:bg-olive-light"
                    }`}
                  >
                    <p className={`font-heading text-sm font-semibold ${depth === d.id ? "text-olive" : "text-forest"}`}>{d.label}</p>
                    <p className="text-[11px] text-muted-text mt-0.5">{d.meta}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full py-2.5 rounded-[10px] bg-olive text-cream font-heading text-sm font-semibold hover:bg-primary-hover transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Active check-in or start */}
      <div className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-heading font-semibold text-forest">
            {activeCheckIn ? "Check-in in progress" : "This week's check-in"}
          </h2>
          <span className="text-[11px] px-2 py-0.5 rounded-pill bg-olive-light text-olive font-medium capitalize">
            {depth.replace("-", " ")}
          </span>
        </div>
        <p className="text-[13px] text-muted-text mb-4">
          {activeCheckIn
            ? "You have an active check-in. Continue where you left off."
            : "Start your check-in when you're both ready."}
        </p>
        {activeCheckIn ? (
          <Link
            href={`/connect/check-in?id=${activeCheckIn.id}`}
            className="inline-block px-5 py-2.5 rounded-[10px] bg-olive text-cream font-heading text-sm font-semibold hover:bg-primary-hover transition-colors"
          >
            Continue check-in →
          </Link>
        ) : (
          <button
            onClick={startCheckIn}
            disabled={starting}
            className="px-5 py-2.5 rounded-[10px] bg-olive text-cream font-heading text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {starting ? "Starting..." : "Start check-in"}
          </button>
        )}
      </div>

      {/* History */}
      <div>
        <h2 className="font-heading font-semibold text-forest mb-3">History</h2>
        {completedCheckIns.length === 0 ? (
          <p className="text-sm text-muted-text">No completed check-ins yet.</p>
        ) : (
          <div className="space-y-1">
            {completedCheckIns.map((ci) => (
              <button
                key={ci.id}
                onClick={() => setSelectedHistory(selectedHistory === ci.id ? null : ci.id)}
                className="w-full flex items-center justify-between p-3 rounded-[10px] bg-surface border border-border hover:bg-olive-light transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-olive">✓</span>
                  <span className="text-sm font-medium text-forest">
                    {new Date(ci.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-xl bg-olive-light text-olive font-medium capitalize">
                    {ci.depth.replace("-", " ")}
                  </span>
                </div>
                <span className="text-xs text-olive font-medium">View →</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
