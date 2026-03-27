"use client";

import { useState } from "react";
import Link from "next/link";
import { useProfile, useUnit } from "@/hooks/use-unit";
import { useGoals } from "@/hooks/use-goals";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const PILLAR_CARDS = [
  { name: "Us", desc: "Your identity", href: "/us", emoji: "👥" },
  { name: "Connect", desc: "Check-ins", href: "/connect", emoji: "💬" },
  { name: "Life", desc: "Adventures", href: "/life", emoji: "🌍" },
  { name: "Money", desc: "Finances", href: "/money", emoji: "💰" },
  { name: "Vault", desc: "Documents", href: "/vault", emoji: "🗂️" },
];

export default function DashboardPage() {
  const { profile } = useProfile();
  const { unit } = useUnit();
  const { goals, addGoal, updateGoal } = useGoals();
  const [newGoal, setNewGoal] = useState("");
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [celebrating, setCelebrating] = useState<string | null>(null);

  const name = profile?.name || "there";
  const cadence = unit?.check_in_cadence || "weekly";

  function handleProgressChange(goalId: string, progress: number) {
    updateGoal(goalId, { progress });
    if (progress >= 100) {
      setCelebrating(goalId);
      setTimeout(() => {
        setCelebrating(null);
        updateGoal(goalId, { is_archived: true });
      }, 2500);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="font-heading text-[26px] font-semibold text-forest tracking-tight">
          {getGreeting()}, {name}
        </h1>
        <p className="text-[13px] text-muted-text mt-0.5">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Check-in banner */}
      <div className="rounded-[18px] p-5 border border-amber/35 bg-gradient-to-r from-amber/[0.13] to-amber/[0.06]">
        <div className="flex items-start justify-between mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-terra">
            Your next check-in
          </span>
          <span className="text-xs text-muted-text capitalize">{cadence}</span>
        </div>
        <p className="font-heading text-lg font-semibold text-forest">
          Ready when you are
        </p>
        <p className="text-[13px] text-muted-text mt-0.5 mb-4">
          Stay connected with a quick check-in.
        </p>
        <div className="flex gap-2">
          <Link
            href="/connect"
            className="px-4 py-2 text-xs rounded-lg bg-olive text-cream font-medium hover:bg-primary-hover transition-colors"
          >
            Start check-in
          </Link>
          <button className="px-4 py-2 text-xs rounded-lg border border-border text-muted-text font-medium hover:border-olive hover:text-olive transition-all">
            Send reminder
          </button>
        </div>
      </div>

      {/* Goals */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-forest">Unit goals</h2>
          <button
            onClick={() => setShowAddGoal(true)}
            className="text-xs text-olive font-medium hover:underline"
          >
            + Add goal
          </button>
        </div>

        {showAddGoal && (
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="e.g. Emergency Fund"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newGoal.trim()) {
                  addGoal(newGoal.trim());
                  setNewGoal("");
                  setShowAddGoal(false);
                }
              }}
              autoFocus
              className="flex-1 px-3 py-2 rounded-[10px] border-[1.5px] border-border bg-surface text-sm text-forest placeholder:text-[#b8b39a] focus:outline-none focus:border-olive focus:shadow-[0_0_0_3px_rgba(96,108,56,0.12)] transition-all"
            />
            <button
              onClick={() => {
                if (newGoal.trim()) {
                  addGoal(newGoal.trim());
                  setNewGoal("");
                  setShowAddGoal(false);
                }
              }}
              className="px-3 py-2 rounded-lg bg-olive text-cream text-sm font-medium"
            >
              Add
            </button>
            <button
              onClick={() => { setShowAddGoal(false); setNewGoal(""); }}
              className="px-3 py-2 rounded-lg border border-border text-muted-text text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        {goals.length === 0 && !showAddGoal && (
          <div className="rounded-[14px] border border-border bg-surface p-6 text-center">
            <p className="text-sm text-muted-text">
              No goals yet. Add your first shared goal.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="relative rounded-[14px] border border-border bg-surface p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              {celebrating === goal.id && (
                <div className="absolute inset-0 flex items-center justify-center z-10" style={{ animation: "celebrateBounce 2s ease" }}>
                  <span className="text-5xl">🎉</span>
                </div>
              )}

              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {editingGoal === goal.id ? (
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => {
                        if (editTitle.trim()) updateGoal(goal.id, { title: editTitle.trim() });
                        setEditingGoal(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (editTitle.trim()) updateGoal(goal.id, { title: editTitle.trim() });
                          setEditingGoal(null);
                        }
                      }}
                      autoFocus
                      className="text-sm font-medium text-forest bg-transparent border-b border-olive outline-none"
                    />
                  ) : (
                    <span className="text-sm font-medium text-forest">{goal.title}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-olive">
                    {goal.progress}%
                  </span>
                  <button
                    onClick={() => { setEditingGoal(goal.id); setEditTitle(goal.title); }}
                    className="text-xs text-muted-text hover:text-olive transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => updateGoal(goal.id, { is_archived: true })}
                    className="text-xs text-muted-text hover:text-terra transition-colors"
                  >
                    Archive
                  </button>
                </div>
              </div>

              {goal.deadline && (
                <p className="text-[11px] text-muted-text mb-2">
                  Due {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              )}

              {/* Progress bar */}
              <div
                className="group relative h-2 bg-olive-light rounded-pill cursor-ew-resize"
                onMouseDown={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  function onMove(ev: MouseEvent) {
                    const pct = Math.min(100, Math.max(0, Math.round(((ev.clientX - rect.left) / rect.width) * 100)));
                    handleProgressChange(goal.id, pct);
                  }
                  function onUp() {
                    document.removeEventListener("mousemove", onMove);
                    document.removeEventListener("mouseup", onUp);
                  }
                  document.addEventListener("mousemove", onMove);
                  document.addEventListener("mouseup", onUp);
                }}
                onTouchStart={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  function onMove(ev: TouchEvent) {
                    const touch = ev.touches[0];
                    const pct = Math.min(100, Math.max(0, Math.round(((touch.clientX - rect.left) / rect.width) * 100)));
                    handleProgressChange(goal.id, pct);
                  }
                  function onEnd() {
                    document.removeEventListener("touchmove", onMove);
                    document.removeEventListener("touchend", onEnd);
                  }
                  document.addEventListener("touchmove", onMove);
                  document.addEventListener("touchend", onEnd);
                }}
              >
                <div
                  className="h-full bg-olive rounded-pill transition-[width] duration-300 ease-out"
                  style={{ width: `${goal.progress}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-olive border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `${goal.progress}%`, transform: `translate(-50%, -50%)` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pillars */}
      <div>
        <h2 className="font-heading font-semibold text-forest mb-3">Pillars</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PILLAR_CARDS.map((p) => (
            <Link
              key={p.name}
              href={p.href}
              className="flex items-center justify-between p-4 rounded-[14px] border border-border bg-surface shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <span className="text-[22px]">{p.emoji}</span>
                <div>
                  <p className="font-heading text-sm font-semibold text-forest">
                    {p.name}
                  </p>
                  <p className="text-xs text-muted-text">{p.desc}</p>
                </div>
              </div>
              <span className="text-border group-hover:text-olive group-hover:translate-x-0.5 transition-all duration-150">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
