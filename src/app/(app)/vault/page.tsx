"use client";

import { useState } from "react";

type Category = "all" | "identity" | "property" | "finance" | "health" | "other";

interface VaultDoc {
  id: string;
  name: string;
  category: Category;
  owner: string;
  expiry: string | null;
  has2fa: boolean;
}

const SUGGESTED_DOCS = [
  "Passport", "Residency Visa", "Health Insurance", "Car Insurance",
  "Home/Rental Contract", "Marriage Certificate", "Birth Certificate",
  "Bank Statements", "Investment Portfolio", "Medical Records",
];

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "identity", label: "Identity" },
  { id: "property", label: "Property" },
  { id: "finance", label: "Finance" },
  { id: "health", label: "Health" },
  { id: "other", label: "Other" },
];

export default function VaultPage() {
  const [category, setCategory] = useState<Category>("all");
  const [docs, setDocs] = useState<VaultDoc[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showNudge, setShowNudge] = useState(true);
  const [show2fa, setShow2fa] = useState<string | null>(null);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newDoc, setNewDoc] = useState({ name: "", category: "identity" as Category, owner: "shared", expiry: "", has2fa: false });

  function addDoc() {
    if (!newDoc.name) return;
    const doc: VaultDoc = {
      id: crypto.randomUUID(),
      name: newDoc.name,
      category: newDoc.category,
      owner: newDoc.owner,
      expiry: newDoc.expiry || null,
      has2fa: newDoc.has2fa,
    };
    setDocs([...docs, doc]);
    setNewDoc({ name: "", category: "identity", owner: "shared", expiry: "", has2fa: false });
    setShowUpload(false);
  }

  function expiryColor(expiry: string | null) {
    if (!expiry) return "";
    const months = (new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
    if (months < 3) return "border-destructive/50 bg-destructive/5";
    if (months < 12) return "border-amber/50 bg-amber/5";
    return "border-olive/30 bg-olive/5";
  }

  const filtered = category === "all" ? docs : docs.filter((d) => d.category === category);
  const expiring = docs.filter((d) => {
    if (!d.expiry) return false;
    const months = (new Date(d.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
    return months < 12;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-[26px] font-semibold text-forest">Vault</h1>
        <button onClick={() => setShowUpload(true)} className="text-xs text-olive font-medium hover:underline">+ Upload</button>
      </div>

      {/* Missing docs nudge */}
      {showNudge && docs.length < 3 && (
        <div className="rounded-[14px] border border-amber/35 bg-gradient-to-r from-amber/[0.13] to-amber/[0.06] p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-heading text-sm font-semibold text-forest">Missing documents?</p>
            <button onClick={() => setShowNudge(false)} className="text-xs text-muted-text hover:text-forest">Dismiss</button>
          </div>
          <p className="text-[13px] text-muted-text mb-3">We recommend adding these to your vault:</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_DOCS.map((d) => (
              <span key={d} className="text-[11px] px-2 py-1 rounded-pill bg-surface border border-border text-muted-text">{d}</span>
            ))}
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCategory(c.id)}
            className={`px-3 py-1.5 rounded-pill text-xs font-medium whitespace-nowrap transition-all ${
              category === c.id ? "bg-olive text-white" : "bg-surface border border-border text-muted-text hover:border-olive"
            }`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Documents grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-text">No documents yet. Upload your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((doc) => (
            <div key={doc.id} className={`rounded-[14px] border bg-surface p-4 shadow-sm ${expiryColor(doc.expiry) || "border-border"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-forest">{doc.name}</p>
                  <p className="text-[11px] text-muted-text capitalize mt-0.5">{doc.category} · {doc.owner}</p>
                </div>
                {doc.has2fa && <span className="text-[10px] px-1.5 py-0.5 rounded bg-olive-light text-olive font-medium">2FA</span>}
              </div>
              {doc.expiry && (
                <p className="text-[11px] text-muted-text mt-2">
                  Expires: {new Date(doc.expiry).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => doc.has2fa ? setShow2fa(doc.id) : null}
                  className="text-xs px-3 py-1 rounded-lg border border-border text-olive font-medium hover:bg-olive-light transition-all"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expiry alerts */}
      {expiring.length > 0 && (
        <div>
          <h2 className="font-heading font-semibold text-forest mb-3">Expiry alerts</h2>
          <div className="space-y-2">
            {expiring.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-xl border border-amber/30 bg-amber/5">
                <div>
                  <p className="text-sm font-medium text-forest">{d.name}</p>
                  <p className="text-[11px] text-terra">
                    Expires {new Date(d.expiry!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <button className="text-xs text-olive font-medium">Set reminder</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload form */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest/35" onClick={() => setShowUpload(false)}>
          <div className="bg-surface border border-border rounded-[18px] p-6 max-w-md w-full mx-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-heading text-lg font-semibold text-forest mb-4">Upload document</h2>
            <div className="space-y-3">
              <input placeholder="Document name" value={newDoc.name} onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive transition-all" />
              <div className="flex gap-2">
                <select value={newDoc.category} onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value as Category })}
                  className="flex-1 px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive">
                  {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <select value={newDoc.owner} onChange={(e) => setNewDoc({ ...newDoc, owner: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive">
                  <option value="shared">Shared</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
              <input type="date" placeholder="Expiry date" value={newDoc.expiry} onChange={(e) => setNewDoc({ ...newDoc, expiry: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive" />
              <label className="flex items-center gap-2 text-sm text-forest">
                <input type="checkbox" checked={newDoc.has2fa} onChange={(e) => setNewDoc({ ...newDoc, has2fa: e.target.checked })}
                  className="accent-olive" />
                Require 2FA to view
              </label>
              <div className="w-full h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-sm text-muted-text">
                Drag & drop file or click to upload
              </div>
              <div className="flex gap-2">
                <button onClick={addDoc} className="px-4 py-2 rounded-lg bg-olive text-cream text-sm font-medium">Upload</button>
                <button onClick={() => setShowUpload(false)} className="px-4 py-2 rounded-lg border border-border text-muted-text text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2FA modal */}
      {show2fa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest/35" onClick={() => setShow2fa(null)}>
          <div className="bg-surface border border-border rounded-[18px] p-6 max-w-sm w-full mx-4 animate-fade-in text-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-heading text-lg font-semibold text-forest mb-2">Enter verification code</h2>
            <p className="text-xs text-muted-text mb-6">A 6-digit code was sent to your email.</p>
            <div className="flex gap-2 justify-center mb-6">
              {code.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const newCode = [...code];
                    newCode[i] = e.target.value;
                    setCode(newCode);
                    if (e.target.value && i < 5) {
                      const next = e.target.parentElement?.children[i + 1] as HTMLInputElement;
                      next?.focus();
                    }
                  }}
                  className="w-10 h-12 text-center text-lg font-heading font-semibold rounded-lg border-[1.5px] border-border bg-cream text-forest focus:outline-none focus:border-olive transition-all"
                />
              ))}
            </div>
            <button onClick={() => setShow2fa(null)} className="px-6 py-2.5 rounded-lg bg-olive text-cream font-medium text-sm">Verify</button>
          </div>
        </div>
      )}
    </div>
  );
}
