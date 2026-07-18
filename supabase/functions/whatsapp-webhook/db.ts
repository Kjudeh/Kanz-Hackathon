// Supabase data access (service role — bypasses RLS). Used only server-side.

import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { getEnv } from "./env.ts";
import type { Employer, Profile } from "./types.ts";

export function getAdminClient(): SupabaseClient {
  const env = getEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function upsertUser(supa: SupabaseClient, whatsappNumber: string) {
  const { data: existing, error: selErr } = await supa
    .from("users").select("*").eq("whatsapp_number", whatsappNumber).maybeSingle();
  if (selErr) throw selErr;
  if (existing) return existing;

  const { data, error } = await supa
    .from("users")
    .insert({ whatsapp_number: whatsappNumber, state: "interviewing" })
    .select().single();
  if (error) throw error;
  return data;
}

export async function getOrCreateProfile(supa: SupabaseClient, userId: string): Promise<Profile> {
  const { data: existing, error } = await supa
    .from("profiles").select("*").eq("user_id", userId)
    .order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (error) throw error;
  if (existing) return existing as Profile;

  const { data, error: insErr } = await supa
    .from("profiles").insert({ user_id: userId }).select().single();
  if (insErr) throw insErr;
  return data as Profile;
}

export async function getRecentHistory(supa: SupabaseClient, userId: string, limit = 12) {
  const { data, error } = await supa
    .from("conversations").select("direction,medium,transcript,created_at")
    .eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []).reverse();
}

export async function logConversation(
  supa: SupabaseClient, userId: string,
  direction: "inbound" | "outbound", medium: "voice" | "text", transcript: string,
) {
  const { error } = await supa
    .from("conversations").insert({ user_id: userId, direction, medium, transcript });
  if (error) console.error("[logConversation]", error);
}

export async function updateProfile(supa: SupabaseClient, profileId: string, fields: Record<string, unknown>) {
  if (Object.keys(fields).length === 0) return;
  const { error } = await supa.from("profiles").update(fields).eq("id", profileId);
  if (error) throw error;
}

export async function setUserState(supa: SupabaseClient, userId: string, state: string) {
  const { error } = await supa.from("users").update({ state }).eq("id", userId);
  if (error) console.error("[setUserState]", error);
}

// Merge newly-extracted fields into the existing profile without losing prior data.
// Scalars overwrite (when non-empty); arrays union; employers dedupe by name.
export function mergeProfile(profile: Profile, updates: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!updates) return out;

  for (const k of ["full_name", "role_trade", "achievement"]) {
    const v = updates[k];
    if (typeof v === "string" && v.trim()) out[k] = v.trim();
  }

  for (const k of ["skills", "tools"]) {
    const incoming = updates[k];
    if (Array.isArray(incoming)) {
      const cur: string[] = Array.isArray((profile as any)[k]) ? (profile as any)[k] : [];
      const next = [...cur, ...incoming.map((x) => String(x).trim())].filter(Boolean);
      out[k] = Array.from(new Set(next));
    }
  }

  if (Array.isArray(updates.employers)) {
    const cur: Employer[] = Array.isArray(profile.employers) ? profile.employers : [];
    const byName = new Map<string, Employer>();
    for (const e of [...cur, ...(updates.employers as Employer[])]) {
      if (e && typeof e === "object" && (e as Employer).name) {
        byName.set(String((e as Employer).name).trim(), e as Employer);
      }
    }
    out.employers = [...byName.values()];
  }

  out.raw_extracted = {
    ...(profile.raw_extracted ?? {}),
    last_updates: updates,
    updated_at: new Date().toISOString(),
  };
  return out;
}
