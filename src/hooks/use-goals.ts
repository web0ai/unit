"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Goal {
  id: string;
  unit_id: string;
  title: string;
  progress: number;
  deadline: string | null;
  is_archived: boolean;
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("is_archived", false)
      .order("created_at");
    if (data) setGoals(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addGoal = useCallback(async (title: string, deadline?: string) => {
    const supabase = createClient();
    const { data: unit } = await supabase.from("units").select("id").limit(1).single();
    if (!unit) return;
    const { data } = await supabase
      .from("goals")
      .insert({ unit_id: unit.id, title, deadline: deadline || null })
      .select()
      .single();
    if (data) setGoals((g) => [...g, data]);
  }, []);

  const updateGoal = useCallback(async (id: string, patch: Partial<Goal>) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("goals")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (data) {
      if (data.is_archived) {
        setGoals((g) => g.filter((x) => x.id !== id));
      } else {
        setGoals((g) => g.map((x) => (x.id === id ? data : x)));
      }
    }
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    const supabase = createClient();
    await supabase.from("goals").delete().eq("id", id);
    setGoals((g) => g.filter((x) => x.id !== id));
  }, []);

  return { goals, loading, addGoal, updateGoal, deleteGoal };
}
