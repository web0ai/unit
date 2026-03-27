"use client";

import { useState } from "react";
import { useProfile, useUnit, useMembers, usePartnerProfiles } from "@/hooks/use-unit";

const FAMILY_THEMES = [
  { id: "fruits", emoji: "🍋", label: "Fruits" },
  { id: "flowers", emoji: "🌸", label: "Flowers" },
  { id: "plants", emoji: "🌿", label: "Plants" },
  { id: "stars", emoji: "⭐", label: "Stars" },
];

const THEME_AVATARS: Record<string, string[]> = {
  fruits: ["🍋", "🍇", "🌱", "🍊", "🍓"],
  flowers: ["🌸", "🌻", "🌷", "🌺", "🌼"],
  plants: ["🪴", "🌵", "🌿", "🍀", "🌾"],
  stars: ["⭐", "🌟", "✨", "💫", "🌠"],
};

export default function UsPage() {
  const { profile, updateProfile } = useProfile();
  const { unit, updateUnit } = useUnit();
  const { members, addMember, removeMember } = useMembers();
  const partners = usePartnerProfiles();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newChip, setNewChip] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("kid");
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [seasonalIntention, setSeasonalIntention] = useState("");
  const [editingSeason, setEditingSeason] = useState(false);

  const theme = unit?.theme || "fruits";
  const avatars = THEME_AVATARS[theme] || THEME_AVATARS.fruits;

  function startEdit(field: string, currentValue: string) {
    setEditingField(field);
    setEditValue(currentValue);
  }

  function saveEdit(field: string) {
    if (field === "name" || field === "north_star" || field === "birthday") {
      updateProfile({ [field]: editValue });
    } else if (field === "unit_name") {
      updateUnit({ name: editValue });
    }
    setEditingField(null);
  }

  function addChip(field: "working_on" | "habits") {
    if (!newChip.trim() || !profile) return;
    const current = (profile[field] as string[]) || [];
    updateProfile({ [field]: [...current, newChip.trim()] });
    setNewChip("");
  }

  function removeChip(field: "working_on" | "habits", index: number) {
    if (!profile) return;
    const current = (profile[field] as string[]) || [];
    updateProfile({ [field]: current.filter((_, i) => i !== index) });
  }

  if (!profile || !unit) {
    return <div className="animate-fade-in p-4 text-muted-text text-sm">Loading...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="font-heading text-[26px] font-semibold text-forest">Us</h1>

      {/* My Profile */}
      <section className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <h2 className="font-heading text-sm font-semibold text-forest uppercase tracking-wider text-muted-text mb-4">
          My Profile
        </h2>

        <div className="flex items-start gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-olive-light flex items-center justify-center text-3xl">
            {avatars[0]}
          </div>
          <div className="flex-1 space-y-2">
            {/* Name */}
            <EditableField
              label="Name"
              value={profile.name || ""}
              editing={editingField === "name"}
              editValue={editValue}
              onStart={() => startEdit("name", profile.name || "")}
              onChange={setEditValue}
              onSave={() => saveEdit("name")}
            />
            {/* Role */}
            <p className="text-xs text-muted-text capitalize">{profile.role || "Partner"}</p>
            {/* Birthday */}
            <EditableField
              label="Birthday"
              value={profile.birthday ? new Date(profile.birthday).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : "Not set"}
              editing={editingField === "birthday"}
              editValue={editValue}
              onStart={() => startEdit("birthday", profile.birthday || "")}
              onChange={setEditValue}
              onSave={() => saveEdit("birthday")}
              type="date"
            />
          </div>
        </div>

        {/* North Star */}
        <div className="mb-4">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-text mb-1 block">
            North Star
          </label>
          <EditableField
            value={profile.north_star || "What guides you?"}
            editing={editingField === "north_star"}
            editValue={editValue}
            onStart={() => startEdit("north_star", profile.north_star || "")}
            onChange={setEditValue}
            onSave={() => saveEdit("north_star")}
            placeholder="What guides you?"
          />
        </div>

        {/* Working On */}
        <ChipField
          label="Working on this week"
          chips={(profile.working_on as string[]) || []}
          onRemove={(i) => removeChip("working_on", i)}
          newValue={editingField === "working_on" ? newChip : ""}
          onNewChange={(v) => { setEditingField("working_on"); setNewChip(v); }}
          onAdd={() => { addChip("working_on"); setEditingField(null); }}
          placeholder="Add focus..."
        />

        {/* Habits */}
        <ChipField
          label="Habits & skills"
          chips={(profile.habits as string[]) || []}
          onRemove={(i) => removeChip("habits", i)}
          newValue={editingField === "habits" ? newChip : ""}
          onNewChange={(v) => { setEditingField("habits"); setNewChip(v); }}
          onAdd={() => { addChip("habits"); setEditingField(null); }}
          placeholder="Add habit..."
        />
      </section>

      {/* Our Unit */}
      <section className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-text">
            Our Unit
          </h2>
          <button
            onClick={() => setShowThemePicker(!showThemePicker)}
            className="text-xs text-olive font-medium hover:underline"
          >
            {FAMILY_THEMES.find((t) => t.id === theme)?.emoji} Change theme
          </button>
        </div>

        {/* Theme picker */}
        {showThemePicker && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {FAMILY_THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => { updateUnit({ theme: t.id }); setShowThemePicker(false); }}
                className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                  theme === t.id
                    ? "border-olive bg-olive-light"
                    : "border-border bg-cream hover:border-olive"
                }`}
              >
                <span className="text-2xl">{t.emoji}</span>
                <p className="text-[10px] font-medium text-forest mt-1">{t.label}</p>
              </button>
            ))}
          </div>
        )}

        {/* Unit name */}
        <EditableField
          label="Unit name"
          value={unit.name}
          editing={editingField === "unit_name"}
          editValue={editValue}
          onStart={() => startEdit("unit_name", unit.name)}
          onChange={setEditValue}
          onSave={() => saveEdit("unit_name")}
        />

        {/* Partner profiles */}
        <div className="mt-4 space-y-2">
          {partners.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-cream"
            >
              <div className="w-10 h-10 rounded-full bg-olive-light flex items-center justify-center text-xl">
                {avatars[i % avatars.length]}
              </div>
              <div>
                <p className="text-sm font-medium text-forest">{p.name || p.email}</p>
                <p className="text-[11px] text-muted-text capitalize">{p.role || "Partner"}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Non-login members */}
        {members.length > 0 && (
          <div className="mt-3 space-y-2">
            {members.map((m, i) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-cream"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-olive-light flex items-center justify-center text-xl">
                    {avatars[(partners.length + i) % avatars.length]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-forest">{m.name}</p>
                    <p className="text-[11px] text-muted-text capitalize">{m.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeMember(m.id)}
                  className="text-xs text-muted-text hover:text-terra transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add member */}
        {showAddMember ? (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Name"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm text-forest placeholder:text-[#b8b39a] focus:outline-none focus:border-olive transition-all"
            />
            <select
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value)}
              className="px-2 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm text-forest focus:outline-none focus:border-olive"
            >
              <option value="kid">Kid</option>
              <option value="pet">Pet</option>
              <option value="extended">Extended</option>
            </select>
            <button
              onClick={() => {
                if (newMemberName.trim()) {
                  addMember(newMemberName.trim(), newMemberRole);
                  setNewMemberName("");
                  setShowAddMember(false);
                }
              }}
              className="px-3 py-2 rounded-lg bg-olive text-cream text-sm font-medium"
            >
              Add
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddMember(true)}
            className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-border text-sm text-muted-text hover:border-olive hover:text-olive transition-all"
          >
            + Add member
          </button>
        )}
      </section>

      {/* This Season */}
      <section className="rounded-[14px] border border-border bg-surface p-5 shadow-sm">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-text mb-3">
          This Season
        </h2>
        {editingSeason ? (
          <div className="space-y-2">
            <textarea
              value={seasonalIntention}
              onChange={(e) => setSeasonalIntention(e.target.value)}
              placeholder="What's your shared intention this season?"
              rows={3}
              className="w-full px-3.5 py-3 rounded-[10px] border-[1.5px] border-border bg-cream text-sm text-forest placeholder:text-[#b8b39a] focus:outline-none focus:border-olive focus:shadow-[0_0_0_3px_rgba(96,108,56,0.12)] transition-all resize-none"
            />
            <button
              onClick={() => setEditingSeason(false)}
              className="px-4 py-1.5 rounded-lg bg-olive text-cream text-xs font-medium"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingSeason(true)}
            className="w-full text-left p-4 rounded-xl border border-dashed border-border text-sm text-muted-text hover:border-olive hover:text-olive transition-all"
          >
            {seasonalIntention || "Set a shared intention for this season..."}
          </button>
        )}
      </section>
    </div>
  );
}

/* ─── Shared Components ────────────────────────── */

function EditableField({
  label,
  value,
  editing,
  editValue,
  onStart,
  onChange,
  onSave,
  placeholder,
  type = "text",
}: {
  label?: string;
  value: string;
  editing: boolean;
  editValue: string;
  onStart: () => void;
  onChange: (v: string) => void;
  onSave: () => void;
  placeholder?: string;
  type?: string;
}) {
  if (editing) {
    return (
      <input
        type={type}
        value={editValue}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onSave}
        onKeyDown={(e) => e.key === "Enter" && onSave()}
        autoFocus
        placeholder={placeholder}
        className="w-full px-2 py-1 rounded-lg border-b-[1.5px] border-olive bg-transparent text-sm text-forest outline-none"
      />
    );
  }
  return (
    <button onClick={onStart} className="text-left group">
      {label && (
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-text block mb-0.5">
          {label}
        </span>
      )}
      <span className="text-sm text-forest group-hover:text-olive transition-colors">
        {value}
      </span>
      <span className="text-xs text-muted-text opacity-0 group-hover:opacity-100 ml-1.5 transition-opacity">
        ✏️
      </span>
    </button>
  );
}

function ChipField({
  label,
  chips,
  onRemove,
  newValue,
  onNewChange,
  onAdd,
  placeholder,
}: {
  label: string;
  chips: string[];
  onRemove: (i: number) => void;
  newValue: string;
  onNewChange: (v: string) => void;
  onAdd: () => void;
  placeholder: string;
}) {
  return (
    <div className="mb-4">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-text mb-2 block">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-pill bg-olive-light border border-border text-[13px] text-forest"
          >
            {chip}
            <button
              onClick={() => onRemove(i)}
              className="text-muted-text hover:text-terra ml-0.5 transition-colors"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          placeholder={placeholder}
          value={newValue}
          onChange={(e) => onNewChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
          className="px-3 py-1 rounded-pill border border-dashed border-border bg-transparent text-[13px] text-forest placeholder:text-[#b8b39a] focus:outline-none focus:border-olive transition-all w-28"
        />
      </div>
    </div>
  );
}
