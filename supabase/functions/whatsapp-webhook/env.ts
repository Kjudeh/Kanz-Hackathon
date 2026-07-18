// Central environment access. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are
// injected automatically into Edge Functions; the rest are secrets you set.

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ANTHROPIC_API_KEY: string;
  ANTHROPIC_MODEL: string;
  GROQ_API_KEY: string;
  GROQ_MODEL: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_WHATSAPP_FROM: string;
  VALIDATE_TWILIO_SIGNATURE: string;
  WATHEFTI_TEST_SECRET: string;
}

export function getEnv(): Env {
  const g = (k: string, d = "") => Deno.env.get(k) ?? d;
  return {
    SUPABASE_URL: g("SUPABASE_URL"),
    SUPABASE_SERVICE_ROLE_KEY: g("SUPABASE_SERVICE_ROLE_KEY"),
    ANTHROPIC_API_KEY: g("ANTHROPIC_API_KEY"),
    // Set to the current Sonnet model string for your account (see docs/SETUP.md).
    ANTHROPIC_MODEL: g("ANTHROPIC_MODEL", "claude-sonnet-4-20250514"),
    GROQ_API_KEY: g("GROQ_API_KEY"),
    GROQ_MODEL: g("GROQ_MODEL", "whisper-large-v3"),
    TWILIO_ACCOUNT_SID: g("TWILIO_ACCOUNT_SID"),
    TWILIO_AUTH_TOKEN: g("TWILIO_AUTH_TOKEN"),
    TWILIO_WHATSAPP_FROM: g("TWILIO_WHATSAPP_FROM"),
    VALIDATE_TWILIO_SIGNATURE: g("VALIDATE_TWILIO_SIGNATURE", "false"),
    WATHEFTI_TEST_SECRET: g("WATHEFTI_TEST_SECRET"),
  };
}
