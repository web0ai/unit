"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface CheckIn {
  id: string;
  unit_id: string;
  cadence: string;
  depth: string;
  status: string;
  completed_at: string | null;
  created_at: string;
}

interface CheckInResponse {
  id: string;
  check_in_id: string;
  user_id: string;
  responses: Record<string, string>;
  submitted_at: string;
}

export const QUESTIONS: Record<string, { label: string; type: string }[]> = {
  short: [
    { label: "How are you feeling {period}?", type: "scale" },
    { label: "One thing you appreciate about your partner {period}:", type: "text" },
    { label: "One thing you need right now:", type: "text" },
    { label: "Something you're looking forward to:", type: "text" },
  ],
  "less-short": [
    { label: "How are you feeling {period}?", type: "scale" },
    { label: "One thing you appreciate about your partner {period}:", type: "text" },
    { label: "One thing you need right now:", type: "text" },
    { label: "Something you're looking forward to:", type: "text" },
    { label: "What went well {period}?", type: "text" },
    { label: "What was hard {period}?", type: "text" },
    { label: "How aligned do you feel as a team? (1-10)", type: "scale" },
    { label: "Any tension to address?", type: "text" },
    { label: "One shared goal for next {period}:", type: "text" },
  ],
  "not-short": [
    { label: "How are you feeling {period}?", type: "scale" },
    { label: "One thing you appreciate about your partner {period}:", type: "text" },
    { label: "One thing you need right now:", type: "text" },
    { label: "Something you're looking forward to:", type: "text" },
    { label: "What went well {period}?", type: "text" },
    { label: "What was hard {period}?", type: "text" },
    { label: "How aligned do you feel as a team? (1-10)", type: "scale" },
    { label: "Any tension to address?", type: "text" },
    { label: "One shared goal for next {period}:", type: "text" },
    { label: "How are your shared goals progressing?", type: "text" },
    { label: "How are you physically and mentally? (1-10)", type: "scale" },
    { label: "What I wish you understood about me right now:", type: "text" },
    { label: "What I'm holding in and haven't said:", type: "text" },
    { label: "Something to start, stop, or change:", type: "text" },
    { label: "Where do you see us in 3 months?", type: "text" },
  ],
};

function periodWord(cadence: string) {
  if (cadence === "monthly") return "this month";
  if (cadence === "biweekly") return "these two weeks";
  return "this week";
}

export function getQuestions(depth: string, cadence: string) {
  const qs = QUESTIONS[depth] || QUESTIONS.short;
  const period = periodWord(cadence);
  return qs.map((q) => ({
    ...q,
    label: q.label.replace(/\{period\}/g, period),
  }));
}

export function useCheckIns() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("check_ins")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setCheckIns(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function createCheckIn(cadence: string, depth: string) {
    const { data: unit } = await supabase.from("units").select("id").limit(1).single();
    if (!unit) return null;
    const { data } = await supabase
      .from("check_ins")
      .insert({ unit_id: unit.id, cadence, depth, status: "in_progress" })
      .select()
      .single();
    if (data) {
      setCheckIns((c) => [data, ...c]);
      return data;
    }
    return null;
  }

  return { checkIns, loading, createCheckIn, reload: load };
}

export function useCheckInResponses(checkInId: string | null) {
  const [responses, setResponses] = useState<CheckInResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!checkInId) { setLoading(false); return; }
    async function load() {
      const { data } = await supabase
        .from("check_in_responses")
        .select("*")
        .eq("check_in_id", checkInId);
      if (data) setResponses(data);
      setLoading(false);
    }
    load();

    // Realtime subscription for partner responses
    const channel = supabase
      .channel(`check-in-${checkInId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "check_in_responses",
          filter: `check_in_id=eq.${checkInId}`,
        },
        (payload) => {
          setResponses((r) => {
            if (r.find((x) => x.id === (payload.new as CheckInResponse).id)) return r;
            return [...r, payload.new as CheckInResponse];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [checkInId, supabase]);

  async function submitResponse(answers: Record<string, string>) {
    if (!checkInId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("check_in_responses")
      .insert({
        check_in_id: checkInId,
        user_id: user.id,
        responses: answers,
      })
      .select()
      .single();

    if (data) {
      setResponses((r) => [...r, data]);

      // Check if both partners have submitted
      const { count } = await supabase
        .from("check_in_responses")
        .select("*", { count: "exact", head: true })
        .eq("check_in_id", checkInId);

      if (count && count >= 2) {
        await supabase
          .from("check_ins")
          .update({ status: "completed", completed_at: new Date().toISOString() })
          .eq("id", checkInId);
      }
    }
  }

  return { responses, loading, submitResponse };
}
