"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [trip, setTrip] = useState<Record<string, string | null> | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: "", destination: "", notes: "", budget: "", status: "planning" });

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("trips").select("*").eq("id", id).single();
      if (data) {
        setTrip(data);
        setForm({ title: data.title, destination: data.destination || "", notes: data.notes || "", budget: data.budget || "", status: data.status });
      }
    }
    load();
  }, [id, supabase]);

  async function save() {
    await supabase.from("trips").update({
      title: form.title, destination: form.destination || null,
      notes: form.notes || null, budget: form.budget || null, status: form.status,
    }).eq("id", id);
    setTrip({ ...trip, ...form });
    setEditing(false);
  }

  async function deleteTrip() {
    await supabase.from("trips").delete().eq("id", id);
    router.push("/life");
  }

  if (!trip) return <div className="p-4 text-muted-text text-sm animate-fade-in">Loading...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={() => router.push("/life")} className="text-xs text-muted-text hover:text-olive">← Back to Life</button>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="text-xs text-olive font-medium">{editing ? "Cancel" : "Edit"}</button>
          <button onClick={deleteTrip} className="text-xs text-terra font-medium">Delete</button>
        </div>
      </div>

      {editing ? (
        <div className="space-y-4">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Trip name"
            className="w-full px-3 py-2 rounded-lg border-[1.5px] border-border bg-surface text-lg font-heading font-semibold text-forest focus:outline-none focus:border-olive transition-all" />
          <input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Destination"
            className="w-full px-3 py-2 rounded-lg border-[1.5px] border-border bg-surface text-sm focus:outline-none focus:border-olive transition-all" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border-[1.5px] border-border bg-surface text-sm focus:outline-none focus:border-olive">
            <option value="planning">Planning</option>
            <option value="confirmed">Confirmed</option>
          </select>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes..." rows={4}
            className="w-full px-3 py-2 rounded-lg border-[1.5px] border-border bg-surface text-sm focus:outline-none focus:border-olive resize-none transition-all" />
          <input value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="Budget" type="number"
            className="w-full px-3 py-2 rounded-lg border-[1.5px] border-border bg-surface text-sm focus:outline-none focus:border-olive transition-all" />
          <button onClick={save} className="px-5 py-2.5 rounded-lg bg-olive text-cream font-medium text-sm">Save changes</button>
        </div>
      ) : (
        <>
          <div>
            <h1 className="font-heading text-[26px] font-semibold text-forest">{trip.title}</h1>
            {trip.destination && <p className="text-muted-text text-sm mt-1">{trip.destination}</p>}
            <span className={`inline-block mt-2 text-[11px] px-2 py-0.5 rounded-pill font-medium ${
              trip.status === "confirmed" ? "bg-olive-light text-olive" : "bg-amber/20 text-terra"
            }`}>{trip.status}</span>
          </div>
          {trip.start_date && (
            <div className="rounded-[14px] border border-border bg-surface p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-text font-semibold mb-1">Dates</p>
              <p className="text-sm text-forest">
                {new Date(trip.start_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                {trip.end_date && ` — ${new Date(trip.end_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
              </p>
            </div>
          )}
          {trip.budget && (
            <div className="rounded-[14px] border border-border bg-surface p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-text font-semibold mb-1">Budget</p>
              <p className="text-sm text-forest">${Number(trip.budget).toLocaleString()}</p>
            </div>
          )}
          {trip.notes && (
            <div className="rounded-[14px] border border-border bg-surface p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-text font-semibold mb-1">Notes</p>
              <p className="text-sm text-forest whitespace-pre-wrap">{trip.notes}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
