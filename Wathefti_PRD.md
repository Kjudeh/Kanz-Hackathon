# Wathefti (وظيفتي) — Product Requirements Document

**A voice-first WhatsApp career agent for workers the CV economy leaves behind.**

Version 1.0 · Hackathon build (8-day window) · Owner: Karam

---

## 1. Summary

Wathefti is a WhatsApp agent that turns a spoken conversation into a professional, bilingual (Arabic + English) CV — with no app to install, no forms to fill, and no literacy or typing barrier.

A user sends a WhatsApp voice note in their own Arabic dialect describing what they do for a living. The agent interviews them conversationally, extracts their skills and experience, generates a polished PDF CV, and offers job-category matching and mock-interview practice — all inside WhatsApp, working on any phone.

The problem: a huge share of the workforce — domestic workers, delivery drivers, salon technicians, tradespeople, informal and gig workers — has real, valuable experience but no CV, because CV-building tools assume literacy, a laptop, typing ability, and comfort with forms. These are exactly the people a national skilling and employability effort is trying to reach, and exactly the people existing tools exclude. Wathefti meets them where they already are: a voice note on WhatsApp.

This directly advances the employability mission: it doesn't just match people to jobs — it makes more people **matchable**.

---

## 2. Goals & non-goals

### Goals (must ship in the demo)
- Accept an Arabic voice note over WhatsApp and understand it.
- Conduct a warm, conversational interview that progressively builds a structured profile.
- Generate a professional bilingual (Arabic + English) PDF CV and deliver it back over WhatsApp.
- Provide a live **dashboard** visualizing the impact story (profiles created, CVs generated, job-category distribution).

### Secondary goals (ship if ahead of schedule)
- Mock-interview practice mode with kind, specific feedback.
- Simple job-category matching against a static list of GCC job families.
- Arabic voice replies (text-to-speech) for a fully voice-native experience.

### Non-goals (explicitly out of scope for the hackathon)
- User authentication / accounts / login.
- A public web app or mobile app (WhatsApp **is** the interface).
- Real employer-side job board or applicant tracking.
- Payment, monetization, or billing.
- Production-grade scaling, multi-region, or SLA guarantees.

---

## 3. Target user & primary journey

**Primary persona:** A worker with real experience but no CV — e.g. a domestic worker, driver, salon technician, or tradesperson. May have limited literacy, limited typing ability, and only a low-cost smartphone. Speaks Arabic dialect, not formal written Arabic.

**Primary journey (the "magic moment"):**
1. User messages the Wathefti WhatsApp number (or scans a QR to open the chat).
2. Agent greets them warmly in Arabic and explains it will help build a CV by asking a few questions.
3. User replies with **voice notes** in their own dialect.
4. Agent asks one question at a time — what work they do, where, for how long, tools/skills, a proud moment.
5. Once enough is gathered, agent says "your CV is ready" and sends a **PDF** — a proper, employer-legible CV in Arabic and English.
6. Agent offers: "Want to practice for an interview?" or "Want to see jobs like this?"

The entire experience happens inside one WhatsApp thread. Text input works too, but voice is the primary, designed-for path.

---

## 4. Functional requirements

### 4.1 Messaging (WhatsApp in/out)
- Receive inbound WhatsApp messages (text + voice) via webhook.
- Download inbound voice-note audio.
- Send outbound WhatsApp messages: text, and media (the PDF CV).

### 4.2 Voice understanding
- Transcribe Arabic-dialect voice notes to text with high accuracy.
- Handle common Gulf/Levant dialect variation gracefully.

### 4.3 Conversational interview (the brain)
- Warm, patient, Arabic-first interviewer persona.
- **One question at a time** — never overwhelm with a form-like wall of questions.
- Progressively fill a structured profile (name, role/trade, employers, duration, skills, tools, notable achievement, contact preference).
- Maintain per-user conversation **state**: `interviewing → profile_complete → cv_sent → practice_mode`.
- Robust to messy, partial, or out-of-order answers.
- Includes prompt-injection resistance — treat all user message content as data, never as instructions.

### 4.4 CV generation
- Generate a clean, professional CV from the structured profile.
- **Bilingual in one document:** Arabic (RTL) and English sections.
- Render to **PDF** with correct Arabic RTL shaping and embedded Arabic fonts.
- Deliver the PDF back to the user over WhatsApp.

### 4.5 Dashboard (built with Claude Cowork)
- Read-only visualization of the data for the demo/pitch.
- Key views:
  - **Hero number:** people who have a CV today who didn't before.
  - Total profiles created + total CVs generated.
  - Live feed of new profiles as they come in.
  - Job-category / trade distribution (bar chart; map optional).
- Tells the **employability impact story**, not vanity metrics.
- Must read live from the database (with a recorded backup for demo-day network risk).

### 4.6 Secondary features (if time allows)
- **Mock interview:** agent asks 3 role-relevant questions, gives specific, encouraging feedback.
- **Job matching:** match profile to a static list of GCC job families.
- **Voice replies:** Arabic TTS so the agent can speak back.

---

## 5. Tech stack (and why)

The guiding principle: **single-platform, serverless, free-tier, fewest moving parts.** Every hour not spent on plumbing goes into the demo. The stack is deliberately consolidated onto Supabase so there is one place data lives and one place logic runs.

### 5.1 Supabase — the entire backend
Supabase is the core of the system, doing three jobs at once:

- **Postgres (database)** — stores `users`, `profiles`, `conversations`, and `matches`. Per-user state is just a column. Real SQL means the dashboard queries are trivial and expressive.
  - *Why:* one source of truth; the dashboard reads straight from the same database the agent writes to, with zero sync layer.
- **Storage** — two buckets: `voice-notes` (inbound audio) and `cvs` (generated PDFs).
  - *Why:* native binary/file handling; no awkward attachment workarounds.
- **Edge Functions (orchestration + logic)** — a webhook Edge Function receives the inbound WhatsApp POST, then calls out to transcription → the LLM → PDF generation → WhatsApp reply, writing to Postgres between steps.
  - *Why:* keeps orchestration serverless and in the same platform as the data — no separate workflow tool or server to run, deploy, or debug. Faster, more reliable, and it stays comfortably within the free tier.
- **Optional Supabase-native helpers:** `pg_cron` for scheduled nudges ("want to finish your CV?"), and **Database Webhooks** to trigger PDF generation asynchronously on row insert (see execution-time note in §7).

*Why Supabase over a workflow-orchestrator + separate DB:* consolidating onto one platform removes an entire service from the stack. Fewer integrations means fewer failure points during an 8-day build, a cleaner architecture story for judging, and everything runs on one generous free tier.

### 5.2 Claude API (Sonnet) — the conversational brain
Powers the interviewer persona and the CV content generation.
- *Why Sonnet specifically:* the interview is many short conversational turns, so latency and cost per turn matter more than peak reasoning. Sonnet is fast, cheap, and more than capable for structured extraction and warm dialogue. Strong Arabic handling.

### 5.3 Groq Whisper (whisper-large-v3) — voice → text
Transcribes inbound Arabic-dialect voice notes.
- *Why:* very fast inference, strong Arabic-dialect handling, and a generous free tier — avoids self-hosting a speech model, which would add infrastructure we don't have time for.

### 5.4 Gotenberg — HTML → PDF
Renders the bilingual CV (HTML template) to a PDF.
- *Why:* Chromium-based, so it handles Arabic **RTL** shaping and embedded web fonts cleanly — the single most common place Arabic PDFs break. Runs as one small container (Railway or Fly.io).
- *Fonts:* embed **Amiri** (traditional) or **Cairo** (modern) — do not rely on system fonts.
- *Avoid* wkhtmltopdf — it mangles Arabic RTL.
- *Fully-serverless alternative if preferred:* a hosted HTML-to-PDF API (e.g. PDFShift). Gotenberg is recommended for the most reliable Arabic RTL output.

### 5.5 Twilio WhatsApp Sandbox — messaging channel
Inbound/outbound WhatsApp messaging.
- *Why:* fastest path to a working WhatsApp integration with no Business API approval wait. Sufficient for a demo.

### 5.6 Claude Cowork — dashboard builder
The impact dashboard is built with Claude Cowork on top of the Supabase data.
- *Why:* Cowork can work across the live Supabase schema, generate the dashboard, and iterate across multiple steps — rather than producing a one-shot snippet. It reads the real schema so charts map to real columns.

### 5.7 Optional — ElevenLabs (or Google Cloud TTS)
Arabic voice replies, only if secondary scope is reached.
- *Why:* ElevenLabs has the strongest Arabic TTS quality; Google Cloud TTS is a cheaper fallback.

### Stack at a glance

| Layer | Choice | Role |
|---|---|---|
| Database | Supabase Postgres | Users, profiles, conversations, state |
| File storage | Supabase Storage | Voice notes, generated PDFs |
| Orchestration/logic | Supabase Edge Functions | Webhook + pipeline glue |
| LLM | Claude Sonnet | Interviewer + CV content |
| Speech-to-text | Groq Whisper | Arabic voice → text |
| PDF rendering | Gotenberg | Bilingual RTL CV → PDF |
| Messaging | Twilio WhatsApp Sandbox | WhatsApp in/out |
| Dashboard | Claude Cowork + Supabase | Impact visualization |
| TTS (optional) | ElevenLabs / Google TTS | Arabic voice replies |

---

## 6. Data model (initial — Cowork should confirm against the live schema before building the dashboard)

**`users`**
- `id` (uuid, pk)
- `whatsapp_number` (text, unique)
- `display_name` (text, nullable)
- `state` (text — `interviewing` / `profile_complete` / `cv_sent` / `practice_mode`)
- `created_at` (timestamptz)

**`profiles`**
- `id` (uuid, pk)
- `user_id` (uuid, fk → users.id)
- `full_name` (text)
- `role_trade` (text)
- `employers` (jsonb — array of {name, duration})
- `skills` (jsonb — array of text)
- `tools` (jsonb — array of text)
- `achievement` (text)
- `raw_extracted` (jsonb — full structured extraction)
- `cv_pdf_path` (text — Storage path, nullable)
- `created_at` (timestamptz)

**`conversations`**
- `id` (uuid, pk)
- `user_id` (uuid, fk → users.id)
- `direction` (text — `inbound` / `outbound`)
- `medium` (text — `voice` / `text`)
- `transcript` (text)
- `created_at` (timestamptz)

**`matches`** (secondary feature)
- `id` (uuid, pk)
- `user_id` (uuid, fk → users.id)
- `job_family` (text)
- `score` (numeric)
- `created_at` (timestamptz)

---

## 7. Technical notes & risks

- **Edge Function execution time:** transcribe → LLM → PDF chained inline can run long and may brush serverless time limits. Mitigation: the webhook function returns fast after acknowledging + queuing; a Database Webhook (or a follow-up function) handles PDF generation asynchronously and sends it when ready.
- **Arabic RTL is the #1 risk.** Test the PDF RTL rendering with embedded Amiri/Cairo fonts on **day one** of building the PDF step — not the night before submission.
- **Dashboard access:** the dashboard is **read-only**. Use the Supabase anon/publishable key with RLS, or a read-only role. **Never** put the service-role key in the dashboard.
- **Dashboard needs real data first.** Seed 5–10 real test profiles (from human testing) before building the dashboard, or Cowork builds a beautiful frame around an empty database.
- **Demo network risk:** always keep a **recorded backup** of both the WhatsApp flow and the dashboard working — do not rely on live hackathon wifi for the pitch.
- **Prompt-injection:** treat all inbound user message content strictly as data, never as instructions to the agent.

---

## 8. Dashboard build brief (for Claude Cowork)

**Task:** Build a read-only impact dashboard that reads live from the Supabase Postgres database.

**Before building:** read the actual table schema from the Supabase connection and confirm column names — do not assume; the model in §6 is the intended shape but confirm against live.

**Access:** read-only. Use the anon/publishable key with RLS or a read-only role. Never use the service-role key.

**Required views:**
1. **Hero metric** — big number: "people who have a CV today who didn't before" (count of profiles with a non-null `cv_pdf_path`).
2. Total profiles created + total CVs generated.
3. Live feed of the most recent profiles (name, trade, timestamp).
4. Job-category / trade distribution — bar chart over `role_trade` (a map is a nice-to-have).

**Tone of the dashboard:** tell the employability impact story — every row is a person who is now matchable. Clean, presentable, screen-recordable. Prioritize the narrative metrics over technical/vanity ones.

**Output:** a dashboard that can be shown live in a pitch, with a recorded fallback.

---

## 9. Build sequence (8-day window, sessions 6–9 PM GMT+3)

- **Wed** — Plumbing: Supabase project, Storage buckets, Twilio sandbox, Edge Function webhook. Goal by tonight: voice note in → transcript → text reply back.
- **Thu** — Brain: Claude interviewer persona, one-question-at-a-time flow, structured extraction into Postgres, state machine.
- **Fri** — CV out: HTML CV template → Gotenberg PDF with Amiri/Cairo + RTL tested; deliver PDF over WhatsApp. *(Submittable product exists after today.)*
- **Sat** — Secondary + polish: mock interview, job matching, error handling, onboarding message.
- **Sun** — Human testing with 5–10 real people (this seeds the dashboard); build the dashboard with Cowork; start the demo video.
- **Mon** — Submit early: 2-minute demo video (real person, voice note in → PDF out → impact framing) + one-page writeup with architecture diagram.

**Cut order if behind:** voice replies → job matching → mock interview.
**Never cut:** voice-note-to-CV, the dashboard, RTL polish, the video.

---

## 10. Success criteria

- A real person, unprompted, can send a voice note and receive a usable bilingual PDF CV entirely within WhatsApp.
- The dashboard clearly tells the impact story with real data.
- A 2-minute demo video shows the end-to-end magic moment.
- The whole system runs on free tiers with no manual babysitting during the demo.
