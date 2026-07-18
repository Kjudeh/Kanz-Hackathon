// Environment for the generate-cv function.

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ANTHROPIC_API_KEY: string;
  ANTHROPIC_MODEL: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_WHATSAPP_FROM: string;
  // PDF rendering — set ONE of these:
  GOTENBERG_URL: string;      // e.g. https://your-gotenberg.up.railway.app
  PDFSHIFT_API_KEY: string;   // hosted HTML->PDF fallback
  CV_SIGNED_URL_TTL: string;  // seconds a CV download link stays valid
}

export function getEnv(): Env {
  const g = (k: string, d = "") => Deno.env.get(k) ?? d;
  return {
    SUPABASE_URL: g("SUPABASE_URL"),
    SUPABASE_SERVICE_ROLE_KEY: g("SUPABASE_SERVICE_ROLE_KEY"),
    ANTHROPIC_API_KEY: g("ANTHROPIC_API_KEY"),
    ANTHROPIC_MODEL: g("ANTHROPIC_MODEL", "claude-sonnet-5"),
    TWILIO_ACCOUNT_SID: g("TWILIO_ACCOUNT_SID"),
    TWILIO_AUTH_TOKEN: g("TWILIO_AUTH_TOKEN"),
    TWILIO_WHATSAPP_FROM: g("TWILIO_WHATSAPP_FROM"),
    GOTENBERG_URL: g("GOTENBERG_URL"),
    PDFSHIFT_API_KEY: g("PDFSHIFT_API_KEY"),
    CV_SIGNED_URL_TTL: g("CV_SIGNED_URL_TTL", "604800"), // 7 days
  };
}
