"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

// Types
export interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  unit_id: string | null;
  avatar_url: string | null;
  birthday: string | null;
  north_star: string | null;
  working_on: string[];
  habits: string[];
  onboarding_completed: boolean;
}

export interface Unit {
  id: string;
  name: string;
  theme: string;
  visual_theme: string;
  check_in_cadence: string;
  check_in_depth: string;
  subscription_status: string;
}

export interface Member {
  id: string;
  unit_id: string;
  name: string;
  role: string;
  avatar_url: string | null;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data, error: err } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (err) { setError(err.message); setLoading(false); return; }
      setProfile(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateProfile = useCallback(async (patch: Partial<Profile>) => {
    if (!profile) return;
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", profile.id)
      .select()
      .single();
    if (err) { setError(err.message); return; }
    if (data) setProfile(data);
  }, [profile]);

  return { profile, loading, error, updateProfile, reload: load };
}

export function useUnit() {
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data, error: err } = await supabase
        .from("units")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (err) { setError(err.message); setLoading(false); return; }
      setUnit(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load unit");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateUnit = useCallback(async (patch: Partial<Unit>) => {
    if (!unit) return;
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("units")
      .update(patch)
      .eq("id", unit.id)
      .select()
      .single();
    if (err) { setError(err.message); return; }
    if (data) setUnit(data);
  }, [unit]);

  return { unit, loading, error, updateUnit, reload: load };
}

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("members")
      .select("*")
      .order("created_at");
    if (data) setMembers(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addMember = useCallback(async (name: string, role: string) => {
    const supabase = createClient();
    const { data: unit } = await supabase.from("units").select("id").limit(1).single();
    if (!unit) return;
    const { data } = await supabase
      .from("members")
      .insert({ unit_id: unit.id, name, role })
      .select()
      .single();
    if (data) setMembers((m) => [...m, data]);
  }, []);

  const removeMember = useCallback(async (id: string) => {
    const supabase = createClient();
    await supabase.from("members").delete().eq("id", id);
    setMembers((m) => m.filter((x) => x.id !== id));
  }, []);

  return { members, loading, addMember, removeMember };
}

export function usePartnerProfiles() {
  const [partners, setPartners] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .not("unit_id", "is", null);
      if (data) setPartners(data);
      setLoading(false);
    }
    load();
  }, []);

  return { partners, loading };
}
