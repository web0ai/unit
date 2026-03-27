"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Tab = "travel" | "bucket" | "dates";

interface Trip {
  id: string;
  title: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  notes: string | null;
  budget: string | null;
}

interface BucketItem {
  id: string;
  title: string;
  owner: string;
  is_completed: boolean;
  category: string | null;
}

interface DateIdea {
  id: string;
  title: string;
  category: string | null;
  location: string | null;
  cost_level: string | null;
  is_favorite: boolean;
  last_done_at: string | null;
}

const DATE_TEMPLATES = [
  { cat: "Question Games", ideas: ["36 Questions to Fall in Love", "The And Card Game", "Future Vision Cards", "Would You Rather (Couples Edition)"] },
  { cat: "Date Formats", ideas: ["Cook-off Challenge", "Picnic in the Park", "Sunset Drive", "No-Phone Dinner", "Breakfast Date"] },
  { cat: "Adventure Ideas", ideas: ["Sunrise Hike", "Day Trip to a New City", "Kayak or Paddleboard", "Stargazing Night", "Street Food Tour"] },
];

export default function LifePage() {
  const [tab, setTab] = useState<Tab>("travel");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bucketItems, setBucketItems] = useState<BucketItem[]>([]);
  const [dateIdeas, setDateIdeas] = useState<DateIdea[]>([]);
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [showAddBucket, setShowAddBucket] = useState(false);
  const [showAddDate, setShowAddDate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [bucketTab, setBucketTab] = useState("all");
  const [newTrip, setNewTrip] = useState({ title: "", destination: "", start_date: "", end_date: "" });
  const [newBucket, setNewBucket] = useState({ title: "", owner: "shared" });
  const [newDate, setNewDate] = useState({ title: "", category: "", location: "", cost_level: "$" });

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const [t, b, d] = await Promise.all([
        supabase.from("trips").select("*").order("start_date"),
        supabase.from("bucket_list_items").select("*").order("created_at"),
        supabase.from("date_ideas").select("*").order("created_at"),
      ]);
      if (t.data) setTrips(t.data);
      if (b.data) setBucketItems(b.data);
      if (d.data) setDateIdeas(d.data);
    }
    load();
  }, [supabase]);

  async function addTrip() {
    if (!newTrip.title) return;
    const { data: unit } = await supabase.from("units").select("id").limit(1).single();
    if (!unit) return;
    const { data } = await supabase.from("trips").insert({
      unit_id: unit.id, title: newTrip.title, destination: newTrip.destination || null,
      start_date: newTrip.start_date || null, end_date: newTrip.end_date || null,
    }).select().single();
    if (data) { setTrips([...trips, data]); setNewTrip({ title: "", destination: "", start_date: "", end_date: "" }); setShowAddTrip(false); }
  }

  async function addBucketItem() {
    if (!newBucket.title) return;
    const { data: unit } = await supabase.from("units").select("id").limit(1).single();
    if (!unit) return;
    const { data } = await supabase.from("bucket_list_items").insert({
      unit_id: unit.id, title: newBucket.title, owner: newBucket.owner,
    }).select().single();
    if (data) { setBucketItems([...bucketItems, data]); setNewBucket({ title: "", owner: "shared" }); setShowAddBucket(false); }
  }

  async function toggleBucket(id: string, completed: boolean) {
    await supabase.from("bucket_list_items").update({ is_completed: completed }).eq("id", id);
    setBucketItems(bucketItems.map((b) => b.id === id ? { ...b, is_completed: completed } : b));
  }

  async function addDateIdea(title?: string) {
    const t = title || newDate.title;
    if (!t) return;
    const { data: unit } = await supabase.from("units").select("id").limit(1).single();
    if (!unit) return;
    const { data } = await supabase.from("date_ideas").insert({
      unit_id: unit.id, title: t, category: newDate.category || null,
      location: newDate.location || null, cost_level: newDate.cost_level || null,
    }).select().single();
    if (data) { setDateIdeas([...dateIdeas, data]); setNewDate({ title: "", category: "", location: "", cost_level: "$" }); setShowAddDate(false); }
  }

  async function markDateDone(id: string) {
    await supabase.from("date_ideas").update({ last_done_at: new Date().toISOString() }).eq("id", id);
    setDateIdeas(dateIdeas.map((d) => d.id === id ? { ...d, last_done_at: new Date().toISOString() } : d));
  }

  const filteredBucket = bucketTab === "all" ? bucketItems : bucketItems.filter((b) =>
    bucketTab === "shared" ? b.owner === "shared" : b.owner !== "shared"
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-heading text-[26px] font-semibold text-forest">Life</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted">
        {(["travel", "bucket", "dates"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t ? "bg-surface text-forest shadow-sm" : "text-muted-text hover:text-forest"
            }`}
          >
            {t === "dates" ? "Date Ideas" : t === "bucket" ? "Bucket List" : "Travel"}
          </button>
        ))}
      </div>

      {/* Travel */}
      {tab === "travel" && (
        <div className="space-y-4">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              href={`/life/trip/${trip.id}`}
              className="block rounded-[14px] border border-border bg-surface p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-heading text-sm font-semibold text-forest">{trip.title}</h3>
                <span className={`text-[11px] px-2 py-0.5 rounded-pill font-medium ${
                  trip.status === "confirmed" ? "bg-olive-light text-olive" : "bg-amber/20 text-terra"
                }`}>
                  {trip.status}
                </span>
              </div>
              {trip.destination && <p className="text-xs text-muted-text">{trip.destination}</p>}
              {trip.start_date && (
                <p className="text-xs text-muted-text mt-1">
                  {new Date(trip.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {trip.end_date && ` — ${new Date(trip.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                </p>
              )}
            </Link>
          ))}

          {showAddTrip ? (
            <div className="rounded-[14px] border border-border bg-surface p-4 space-y-3">
              <input placeholder="Trip name" value={newTrip.title} onChange={(e) => setNewTrip({ ...newTrip, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm text-forest placeholder:text-[#b8b39a] focus:outline-none focus:border-olive transition-all" />
              <input placeholder="Destination" value={newTrip.destination} onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm text-forest placeholder:text-[#b8b39a] focus:outline-none focus:border-olive transition-all" />
              <div className="flex gap-2">
                <input type="date" value={newTrip.start_date} onChange={(e) => setNewTrip({ ...newTrip, start_date: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive" />
                <input type="date" value={newTrip.end_date} onChange={(e) => setNewTrip({ ...newTrip, end_date: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive" />
              </div>
              <div className="flex gap-2">
                <button onClick={addTrip} className="px-4 py-2 rounded-lg bg-olive text-cream text-sm font-medium">Add trip</button>
                <button onClick={() => setShowAddTrip(false)} className="px-4 py-2 rounded-lg border border-border text-muted-text text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddTrip(true)} className="w-full py-3 rounded-xl border border-dashed border-border text-sm text-muted-text hover:border-olive hover:text-olive transition-all">
              + Add trip
            </button>
          )}
        </div>
      )}

      {/* Bucket List */}
      {tab === "bucket" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {["all", "shared", "personal"].map((t) => (
              <button key={t} onClick={() => setBucketTab(t)}
                className={`px-3 py-1.5 rounded-pill text-xs font-medium capitalize transition-all ${
                  bucketTab === t ? "bg-olive text-white" : "bg-surface border border-border text-muted-text hover:border-olive"
                }`}>
                {t === "all" ? "All" : t === "shared" ? "Our list" : "Personal"}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredBucket.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface">
                <button onClick={() => toggleBucket(item.id, !item.is_completed)}
                  className={`w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center transition-all ${
                    item.is_completed ? "bg-olive border-olive" : "border-border hover:border-olive"
                  }`}>
                  {item.is_completed && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  )}
                </button>
                <span className={`flex-1 text-sm ${item.is_completed ? "line-through text-muted-text" : "text-forest"}`}>{item.title}</span>
                <span className="text-[10px] text-muted-text capitalize">{item.owner}</span>
              </div>
            ))}
          </div>

          {showAddBucket ? (
            <div className="flex gap-2">
              <input placeholder="Add item..." value={newBucket.title} onChange={(e) => setNewBucket({ ...newBucket, title: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addBucketItem()} autoFocus
                className="flex-1 px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm text-forest placeholder:text-[#b8b39a] focus:outline-none focus:border-olive transition-all" />
              <select value={newBucket.owner} onChange={(e) => setNewBucket({ ...newBucket, owner: e.target.value })}
                className="px-2 py-2 rounded-lg border-[1.5px] border-border bg-cream text-xs focus:outline-none focus:border-olive">
                <option value="shared">Our list</option>
                <option value="personal">My list</option>
              </select>
              <button onClick={addBucketItem} className="px-3 py-2 rounded-lg bg-olive text-cream text-sm font-medium">Add</button>
            </div>
          ) : (
            <button onClick={() => setShowAddBucket(true)} className="w-full py-3 rounded-xl border border-dashed border-border text-sm text-muted-text hover:border-olive hover:text-olive transition-all">
              + Add item
            </button>
          )}
        </div>
      )}

      {/* Date Ideas */}
      {tab === "dates" && (
        <div className="space-y-4">
          {dateIdeas.map((idea) => (
            <div key={idea.id} className="rounded-[14px] border border-border bg-surface p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-forest">{idea.title}</h3>
                  <div className="flex gap-2 mt-1">
                    {idea.category && <span className="text-[10px] text-muted-text">{idea.category}</span>}
                    {idea.cost_level && <span className="text-[10px] text-muted-text">{idea.cost_level}</span>}
                    {idea.location && <span className="text-[10px] text-muted-text">{idea.location}</span>}
                  </div>
                </div>
                <button onClick={() => markDateDone(idea.id)}
                  className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                    idea.last_done_at ? "bg-olive-light text-olive" : "border border-border text-muted-text hover:border-olive hover:text-olive"
                  }`}>
                  {idea.last_done_at ? "Done ✓" : "Mark done"}
                </button>
              </div>
            </div>
          ))}

          {showAddDate ? (
            <div className="rounded-[14px] border border-border bg-surface p-4 space-y-3">
              <input placeholder="Date idea name" value={newDate.title} onChange={(e) => setNewDate({ ...newDate, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm text-forest placeholder:text-[#b8b39a] focus:outline-none focus:border-olive transition-all" />
              <div className="flex gap-2">
                <input placeholder="Category" value={newDate.category} onChange={(e) => setNewDate({ ...newDate, category: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm placeholder:text-[#b8b39a] focus:outline-none focus:border-olive transition-all" />
                <input placeholder="Location" value={newDate.location} onChange={(e) => setNewDate({ ...newDate, location: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm placeholder:text-[#b8b39a] focus:outline-none focus:border-olive transition-all" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => addDateIdea()} className="px-4 py-2 rounded-lg bg-olive text-cream text-sm font-medium">Add</button>
                <button onClick={() => setShowAddDate(false)} className="px-4 py-2 rounded-lg border border-border text-muted-text text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setShowAddDate(true)} className="flex-1 py-3 rounded-xl border border-dashed border-border text-sm text-muted-text hover:border-olive hover:text-olive transition-all">
                + Add your own
              </button>
              <button onClick={() => setShowTemplates(!showTemplates)} className="flex-1 py-3 rounded-xl border border-olive/30 text-sm text-olive font-medium hover:bg-olive-light transition-all">
                Browse templates
              </button>
            </div>
          )}

          {showTemplates && (
            <div className="space-y-4">
              {DATE_TEMPLATES.map((cat) => (
                <div key={cat.cat}>
                  <h3 className="font-heading text-sm font-semibold text-forest mb-2">{cat.cat}</h3>
                  <div className="space-y-1">
                    {cat.ideas.map((idea) => (
                      <div key={idea} className="flex items-center justify-between p-3 rounded-lg border border-border bg-cream">
                        <span className="text-sm text-forest">{idea}</span>
                        <button onClick={() => addDateIdea(idea)}
                          className="text-xs text-olive font-medium hover:underline">+ Save</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
