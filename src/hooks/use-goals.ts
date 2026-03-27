"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Goal {
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
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("goals")
        .select("*")
        .eq("is_archived", false)
        .order("created_at");
      if (data) setGoals(data);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function addGoal(title: string, deadline?: string) {
    const { data: unit } = await supabase.from("units").select("id").limit(1).single();
    if (!unit) return;
    const { data } = await supabase
      .from("goals")
      .insert({ unit_id: unit.id, title, deadline: deadline || null })
      .select()
      .single();
    if (data) setGoals((g) => [...g, data]);
  }

  async function updateGoal(id: string, patch: Partial<Goal>) {
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
  }

  async function deleteGoal(id: string) {
    await supabase.from("goals").delete().eq("id", id);
    setGoals((g) => g.filter((x) => x.id !== id));
  }

  return { goals, loading, addGoal, updateGoal, deleteGoal };
}
