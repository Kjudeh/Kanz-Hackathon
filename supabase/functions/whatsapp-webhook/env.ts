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
  // Voice replies (Phase 5, optional)
  ELEVENLABS_API_KEY: string;
  ELEVENLABS_VOICE_ID: string;
  ELEVENLABS_MODEL: string;
  WATHEFTI_VOICE_REPLIES: string;
}

export function getEnv(): Env {
  const g = (k: string, d = "") => Deno.env.get(k) ?? d;
  return {
    SUPABASE_URL: g("SUPABASE_URL"),
    SUPABASE_SERVICE_ROLE_KEY: g("SUPABASE_SERVICE_ROLE_KEY"),
    ANTHROPIC_API_KEY: g("ANTHROPIC_API_KEY"),
    // Set to the current Sonnet model string for your account (see docs/SETUP.md).
    ANTHROPIC_MODEL: g("ANTHROPIC_MODEL", "claude-sonnet-5"),
    GROQ_API_KEY: g("GROQ_API_KEY"),
    GROQ_MODEL: g("GROQ_MODEL", "whisper-large-v3"),
    TWILIO_ACCOUNT_SID: g("TWILIO_ACCOUNT_SID"),
    TWILIO_AUTH_TOKEN: g("TWILIO_AUTH_TOKEN"),
    TWILIO_WHATSAPP_FROM: g("TWILIO_WHATSAPP_FROM"),
    VALIDATE_TWILIO_SIGNATURE: g("VALIDATE_TWILIO_SIGNATURE", "false"),
    WATHEFTI_TEST_SECRET: g("WATHEFTI_TEST_SECRET"),
    ELEVENLABS_API_KEY: g("ELEVENLABS_API_KEY"),
    ELEVENLABS_VOICE_ID: g("ELEVENLABS_VOICE_ID"),
    ELEVENLABS_MODEL: g("ELEVENLABS_MODEL", "eleven_multilingual_v2"),
    WATHEFTI_VOICE_REPLIES: g("WATHEFTI_VOICE_REPLIES", "false"),
  };
}
