# Product Requirements Document (v2)
> Naatiq (ناطق) · updated to reflect what was actually built and shipped

## 1. Summary

Naatiq is a WhatsApp agent that turns a spoken conversation into a professional, bilingual
(Arabic + English) CV — with no app to install, no forms to fill, and no literacy or typing
barrier.

A user sends a WhatsApp voice note in their own Arabic dialect describing what they do for a
living. The agent interviews them conversationally, extracts their skills and experience,
generates a polished PDF CV, and delivers it back over WhatsApp. An impact dashboard, a public
landing page and an employer portal sit on top of the same data.

> **Change from v1:** the product was originally named *Wathefti (وظيفتي)*. It was renamed to
> **Naatiq (ناطق)** — "articulate" / "speaking" — which better captures the voice-first premise.
> The rename is applied throughout: the agent persona, the CV footer, the dashboard and all docs.

## 2. Goals

### Shipped
- Accept an Arabic voice note over WhatsApp and understand it. **Done.**
- Conduct a warm, conversational interview that progressively builds a structured profile.
  **Done.**
- Generate a professional bilingual PDF CV and deliver it over WhatsApp. **Done.**
- Provide a live dashboard visualising the impact story. **Done** — Arabic-first with an English
  toggle.

### Added during the build (not in v1)
- **Public landing page** with live counts and a WhatsApp call to action.
- **Employer portal** — browse workers, open their CV, request contact through Naatiq.
- **`placements` table** so the employment figure is real rather than invented.
- **Self-test diagnostic endpoints** on the webhook, which proved decisive in debugging.

### Deferred
- **Arabic voice replies (TTS).** Fully built and deployed, gated behind a feature flag. Blocked
  only by ElevenLabs requiring a paid plan for API voice access. Flip
  `WATHEFTI_VOICE_REPLIES=true` on a paid plan and it works with no code change.
- **Mock interview practice.** Not built.
- **Job-family matching.** Table exists; matching logic not built.

### Non-goals (unchanged)
User authentication, a mobile app, a full employer ATS, payments, production-grade scaling.

## 3. Target user and primary journey

**Primary persona:** a worker with real experience but no CV — domestic worker, driver, salon
technician, tradesperson. May have limited literacy and only a low-cost smartphone. Speaks Arabic
dialect, not formal written Arabic.

**The journey (validated end to end):**

1. The user messages the Naatiq WhatsApp number.
2. The agent greets them warmly in Arabic and explains it will help build a CV.
3. The user replies with voice notes in their own dialect.
4. The agent asks one question at a time — name, trade, employers, skills, tools, a proud moment.
5. Once enough is gathered, the agent says the CV is being prepared and sends a **PDF**.
6. Employers browse the resulting profiles and request contact through Naatiq.

## 4. Functional requirements

| Area | Requirement | Status |
|---|---|---|
| Messaging | Receive WhatsApp text + voice via webhook; send text and media | Shipped |
| Voice | Transcribe Arabic-dialect voice notes accurately | Shipped |
| Interview | Warm Arabic persona, one question at a time, robust to messy answers | Shipped |
| Interview | Per-user state machine and prompt-injection resistance | Shipped |
| CV | Bilingual content generation, truthful, no fabrication | Shipped |
| CV | PDF with correct Arabic RTL shaping and embedded fonts | Shipped |
| Dashboard | Read-only impact visualisation from live data | Shipped |
| Landing | Public page with live counts and WhatsApp CTA | Shipped |
| Employers | Browse workers, open CVs, request contact | Shipped |
| Voice replies | Arabic TTS responses | Built, flag-gated |
| Mock interview | Practice questions with feedback | Not built |
| Job matching | Match profiles to GCC job families | Not built |

## 5. Data model

- **`users`** — `whatsapp_number` (unique), `display_name`, `state`, `created_at`.
  State machine: `interviewing → profile_complete → cv_sent → practice_mode`.
- **`profiles`** — `full_name`, `first_name` (generated), `role_trade`, `employers` (jsonb),
  `skills`, `tools`, `achievement`, `raw_extracted`, `cv_pdf_path`.
- **`conversations`** — `direction`, `medium` (voice/text), `transcript`, `created_at`.
- **`matches`** — job-family scoring (reserved; matching not implemented).
- **`placements`** — `employer_name`, `job_title`, `placed_at`. Powers the honest employment count.

Public surfaces never read these tables directly. They read three **read-only views**
(`dashboard_stats`, `dashboard_profiles`, `dashboard_trade_distribution`) that expose first names
only and never phone numbers.

## 6. Success criteria

| Criterion | Result |
|---|---|
| A real person can send a voice note and receive a usable bilingual PDF CV in WhatsApp | **Met** |
| The dashboard tells the impact story with real data | **Met** |
| The system runs on free tiers with no manual babysitting | **Met** |
| A 2-minute demo video shows the magic moment | Outstanding |

## 7. Known risks and how they were handled

- **Arabic RTL rendering — the #1 risk in v1.** Handled by choosing Gotenberg (Chromium), which
  shapes Arabic correctly, and by validating the design with a rendered sample early rather than
  the night before submission.
- **Edge Function execution time.** The webhook acknowledges Twilio immediately and does the slow
  work (transcription, LLM, CV) in a background task, so the ~15s webhook timeout is never at risk.
- **Prompt injection.** All user message content is wrapped and treated strictly as data; the
  system prompt instructs the model never to follow instructions found there.
- **Demo-day network risk.** The dashboard embeds a data snapshot and renders instantly, then
  refreshes live on top — so it never shows an error on stage.
