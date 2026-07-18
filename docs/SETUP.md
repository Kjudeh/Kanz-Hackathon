# Setup — accounts, keys, and configuration

Naatiq runs on free tiers. Secrets go into **Supabase Edge Function secrets** (never
committed to git). Copy `.env.example` → `.env` for local reference; `.env` is gitignored.

## Supabase — done ✅

- Project ref: `pehlozswmyxocwznyjzp` (`eu-west-2`)
- API URL: `https://pehlozswmyxocwznyjzp.supabase.co`
- Schema, RLS, Storage buckets (`voice-notes`, `cvs`), and dashboard views are applied.
- Publishable (client-safe) key is used by the dashboard; the service-role key is used
  only server-side inside Edge Functions.

## Keys you need to provide

### 1. Anthropic (Claude) — the interviewer brain
- Get a key: https://console.anthropic.com → API Keys
- Secret: `ANTHROPIC_API_KEY`

### 2. Groq (Whisper) — Arabic voice → text
- Get a key: https://console.groq.com → API Keys
- Secret: `GROQ_API_KEY`

### 3. Twilio — WhatsApp channel
- Sign up: https://www.twilio.com → Messaging → Try it out → WhatsApp Sandbox
- Join the sandbox from your phone (send the join code to the sandbox number).
- Secrets: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`
- After the webhook function is deployed, set the sandbox **"When a message comes in"**
  webhook to the function URL.

### 4. PDF rendering — pick one (Phase 3)
- **Gotenberg** (recommended — best Arabic RTL): deploy the container on Railway or
  Fly.io; set `GOTENBERG_URL`.
- **Hosted API** (simpler): e.g. PDFShift; set `PDFSHIFT_API_KEY`.

### 5. Optional — ElevenLabs (Arabic TTS, Phase 5)
- Secret: `ELEVENLABS_API_KEY`

## Setting Edge Function secrets

Once functions are deployed, secrets are set in the Supabase dashboard
(Edge Functions → Secrets) or via the CLI. Exact commands are provided as each function
is wired up. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically
into Edge Functions and do not need to be set manually.
