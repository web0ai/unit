"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

type View = "agenda" | "month" | "week";

interface CalEvent {
  id: string;
  title: string;
  date: string;
  end_date: string | null;
  category: string | null;
  recurrence: string | null;
  notes: string | null;
}

const CAT_COLORS: Record<string, string> = {
  "key-date": "bg-amber text-white",
  "goal": "bg-olive text-white",
  "check-in": "bg-terra text-white",
  "trip": "bg-olive-light text-olive",
  default: "bg-muted text-forest",
};

function catBadge(cat: string | null) {
  return CAT_COLORS[cat || ""] || CAT_COLORS.default;
}

export default function SchedulePage() {
  const [view, setView] = useState<View>("agenda");
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", category: "", notes: "" });
  const [currentDate, setCurrentDate] = useState(new Date());

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("events").select("*").order("date");
      if (data) setEvents(data);
    }
    load();
  }, [supabase]);

  async function addEvent() {
    if (!newEvent.title || !newEvent.date) return;
    const { data: unit } = await supabase.from("units").select("id").limit(1).single();
    if (!unit) return;
    const { data } = await supabase.from("events").insert({
      unit_id: unit.id, title: newEvent.title, date: new Date(newEvent.date).toISOString(),
      category: newEvent.category || null, notes: newEvent.notes || null,
    }).select().single();
    if (data) { setEvents([...events, data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())); setNewEvent({ title: "", date: "", category: "", notes: "" }); setShowAdd(false); }
  }

  // Agenda grouping
  const grouped = useMemo(() => {
    const groups: Record<string, CalEvent[]> = {};
    events.forEach((e) => {
      const key = new Date(e.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return groups;
  }, [events]);

  // Month view helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });

  function getEventsForDay(day: number) {
    return events.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  // Week view helpers
  const weekStart = new Date(currentDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-[26px] font-semibold text-forest">Schedule</h1>
        <button onClick={() => setShowAdd(true)} className="text-xs text-olive font-medium hover:underline">+ Add event</button>
      </div>

      {/* View switcher */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted">
        {(["agenda", "month", "week"] as View[]).map((v) => (
          <button key={v} onClick={() => setView(v)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              view === v ? "bg-surface text-forest shadow-sm" : "text-muted-text hover:text-forest"
            }`}>
            {v}
          </button>
        ))}
      </div>

      {/* Add event form */}
      {showAdd && (
        <div className="rounded-[14px] border border-border bg-surface p-4 space-y-3">
          <input placeholder="Event name" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive transition-all" />
          <div className="flex gap-2">
            <input type="datetime-local" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive" />
            <input placeholder="Category" value={newEvent.category} onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive transition-all" />
          </div>
          <textarea placeholder="Notes (optional)" value={newEvent.notes} onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })} rows={2}
            className="w-full px-3 py-2 rounded-lg border-[1.5px] border-border bg-cream text-sm focus:outline-none focus:border-olive resize-none transition-all" />
          <div className="flex gap-2">
            <button onClick={addEvent} className="px-4 py-2 rounded-lg bg-olive text-cream text-sm font-medium">Add</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg border border-border text-muted-text text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Agenda */}
      {view === "agenda" && (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, evts]) => (
            <div key={month}>
              <h3 className="font-heading text-sm font-semibold text-muted-text uppercase tracking-wider mb-2">{month}</h3>
              <div className="space-y-1">
                {evts.map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-3 rounded-[10px] bg-surface border border-border hover:bg-olive-light transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="text-center w-10">
                        <p className="text-[11px] text-muted-text uppercase">{new Date(e.date).toLocaleDateString("en-US", { weekday: "short" })}</p>
                        <p className="font-heading text-lg font-semibold text-forest">{new Date(e.date).getDate()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-forest">{e.title}</p>
                        <p className="text-[11px] text-muted-text">
                          {new Date(e.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    {e.category && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-pill font-medium ${catBadge(e.category)}`}>
                        {e.category}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {events.length === 0 && <p className="text-sm text-muted-text text-center py-8">No events yet.</p>}
        </div>
      )}

      {/* Month */}
      {view === "month" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="text-muted-text hover:text-olive text-sm">← Prev</button>
            <h3 className="font-heading font-semibold text-forest">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="text-muted-text hover:text-olive text-sm">Next →</button>
          </div>
          <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="bg-muted py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-text">{d}</div>
            ))}
            {monthDays.map((day, i) => {
              const dayEvents = day ? getEventsForDay(day) : [];
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
              return (
                <div key={i} className={`bg-surface min-h-[60px] p-1 ${!day ? "bg-muted/50" : ""}`}>
                  {day && (
                    <>
                      <p className={`text-[11px] font-medium ${isToday ? "text-olive font-bold" : "text-forest"}`}>{day}</p>
                      <div className="flex flex-wrap gap-0.5 mt-0.5">
                        {dayEvents.slice(0, 3).map((e) => (
                          <span key={e.id} className={`w-1.5 h-1.5 rounded-full ${e.category ? catBadge(e.category).split(" ")[0] : "bg-olive"}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week */}
      {view === "week" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); }}
              className="text-muted-text hover:text-olive text-sm">← Prev</button>
            <h3 className="font-heading font-semibold text-forest text-sm">
              {weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </h3>
            <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); }}
              className="text-muted-text hover:text-olive text-sm">Next →</button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((d) => {
              const dayEvts = events.filter((e) => {
                const ed = new Date(e.date);
                return ed.toDateString() === d.toDateString();
              });
              const isToday = d.toDateString() === new Date().toDateString();
              return (
                <div key={d.toISOString()} className="min-h-[100px]">
                  <div className={`text-center mb-2 ${isToday ? "text-olive font-bold" : "text-muted-text"}`}>
                    <p className="text-[10px] uppercase">{d.toLocaleDateString("en-US", { weekday: "short" })}</p>
                    <p className="text-sm font-semibold">{d.getDate()}</p>
                  </div>
                  <div className="space-y-1">
                    {dayEvts.map((e) => (
                      <div key={e.id} className={`px-1.5 py-1 rounded text-[10px] font-medium truncate ${catBadge(e.category)}`}>
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
