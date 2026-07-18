# ناطق (Naatiq)

**A voice-first WhatsApp career agent for workers the CV economy leaves behind.**

Naatiq turns a spoken WhatsApp conversation, in the user's own Arabic dialect, into a
professional, bilingual (Arabic + English) PDF CV — no app to install, no forms, no
literacy or typing barrier. It then offers job-category matching and mock-interview
practice, all inside one WhatsApp thread.

See [`Wathefti_PRD.md`](./Wathefti_PRD.md) for the full product spec.

## Architecture

| Layer | Choice | Role |
|---|---|---|
| Database | Supabase Postgres | `users`, `profiles`, `conversations`, `matches`, per-user state |
| File storage | Supabase Storage | `voice-notes` (inbound audio), `cvs` (generated PDFs) |
| Orchestration | Supabase Edge Functions | webhook + pipeline glue |
| LLM | Claude Sonnet | interviewer persona + CV content |
| Speech-to-text | Groq Whisper | Arabic voice → text |
| PDF rendering | Gotenberg / hosted API | bilingual RTL CV → PDF |
| Messaging | Twilio WhatsApp Sandbox | WhatsApp in/out |
| Dashboard | Cowork + Supabase | impact visualization |

Supabase project ref `pehlozswmyxocwznyjzp`, region `eu-west-2`.

## Repo layout

```
supabase/migrations/   SQL migrations (schema + dashboard views)
supabase/functions/    Edge Functions (webhook + pipeline)
cv/                    bilingual RTL HTML CV template + fonts
dashboard/             impact dashboard
docs/                  setup + notes
```

## Status

- [x] **Phase 0** — Supabase project, schema, RLS, Storage buckets, dashboard views
- [x] **Phase 1** — WhatsApp webhook Edge Function (`whatsapp-webhook`, deployed)
- [x] **Phase 2** — Voice transcription (Groq Whisper) + Claude interviewer
- [x] **Phase 3** — Bilingual CV PDF generation (`generate-cv`, deployed)
- [x] **Phase 4** — Impact dashboard (`dashboard/index.html`, live via anon key)
- [ ] **Phase 5** — Secondary features + polish
- [ ] **Live test** — set Edge Function secrets + wire Twilio sandbox, redeploy webhook

## Setup

See [`docs/SETUP.md`](./docs/SETUP.md) for the API keys and configuration required to run
the pipeline. All secrets live in Supabase Edge Function secrets — never committed to git.
