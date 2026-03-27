"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Profile {
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

interface Unit {
  id: string;
  name: string;
  theme: string;
  visual_theme: string;
  check_in_cadence: string;
  check_in_depth: string;
  subscription_status: string;
}

interface Member {
  id: string;
  unit_id: string;
  name: string;
  role: string;
  avatar_url: string | null;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function updateProfile(patch: Partial<Profile>) {
    if (!profile) return;
    const { data } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", profile.id)
      .select()
      .single();
    if (data) setProfile(data);
  }

  return { profile, loading, updateProfile };
}

export function useUnit() {
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("units")
        .select("*")
        .limit(1)
        .single();
      setUnit(data);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function updateUnit(patch: Partial<Unit>) {
    if (!unit) return;
    const { data } = await supabase
      .from("units")
      .update(patch)
      .eq("id", unit.id)
      .select()
      .single();
    if (data) setUnit(data);
  }

  return { unit, loading, updateUnit };
}

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("members")
        .select("*")
        .order("created_at");
      if (data) setMembers(data);
    }
    load();
  }, [supabase]);

  async function addMember(name: string, role: string) {
    const { data: unit } = await supabase.from("units").select("id").limit(1).single();
    if (!unit) return;
    const { data } = await supabase
      .from("members")
      .insert({ unit_id: unit.id, name, role })
      .select()
      .single();
    if (data) setMembers((m) => [...m, data]);
  }

  async function removeMember(id: string) {
    await supabase.from("members").delete().eq("id", id);
    setMembers((m) => m.filter((x) => x.id !== id));
  }

  return { members, addMember, removeMember };
}

export function usePartnerProfiles() {
  const [partners, setPartners] = useState<Profile[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .not("unit_id", "is", null);
      if (data) setPartners(data);
    }
    load();
  }, [supabase]);

  return partners;
}
