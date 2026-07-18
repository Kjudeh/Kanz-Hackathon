// Supabase data access for CV generation (service role).

import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { getEnv } from "./env.ts";

export function getAdminClient(): SupabaseClient {
  const env = getEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getUserById(supa: SupabaseClient, userId: string) {
  const { data, error } = await supa.from("users").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

export async function getLatestProfile(supa: SupabaseClient, userId: string) {
  const { data, error } = await supa
    .from("profiles").select("*").eq("user_id", userId)
    .order("created_at", { ascending: false }).limit(1).single();
  if (error) throw error;
  return data;
}

export async function setCvPath(supa: SupabaseClient, profileId: string, path: string) {
  const { error } = await supa.from("profiles").update({ cv_pdf_path: path }).eq("id", profileId);
  if (error) throw error;
}

export async function setUserState(supa: SupabaseClient, userId: string, state: string) {
  const { error } = await supa.from("users").update({ state }).eq("id", userId);
  if (error) console.error("[setUserState]", error);
}
