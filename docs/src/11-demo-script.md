# Demo Script
> A two-minute demo and a five-minute presentation, with the failure plan

## 1. The one thing to get right

The demo has exactly one job: **show a voice note going in and a professional CV coming out.**

That moment is the product. Every second spent on architecture, stack choices or roadmap is a
second not spent on the thing that makes people lean forward. Show the magic first, explain it
after.

## 2. Two-minute video script

### 0:00–0:20 — The problem

> "This is Um Ahmad. Eleven years as a domestic worker — cooking for large families, caring for an
> elderly parent, running a household. She has never had a CV. Not because she has no experience,
> but because every CV tool ever built assumes you can read, type, and fill in a form.
>
> Millions of workers are locked out of formal hiring for exactly that reason. The barrier isn't
> skill. It's format."

*On screen: a worker with a basic phone. Then a conventional CV builder — a laptop, a long form.*

### 0:20–0:35 — The idea

> "Naatiq turns a voice note into a CV."

*On screen: the logo, then a WhatsApp thread opening.*

### 0:35–1:20 — The demo (the heart of it)

Screen-record a real WhatsApp conversation. Do not narrate over it heavily — let it play.

> "You send a voice note in your own dialect. Naatiq asks one simple question at a time — your
> name, your work, where you've worked, what you're good at, something you're proud of.
>
> No app. No form. No typing. No reading required."

*On screen: voice notes being recorded and sent. Arabic replies arriving. Then the closing message
— the CV is being prepared.*

> "And then this arrives."

*On screen: the PDF notification, then the CV opening full-screen. Hold on it. Scroll slowly
through the Arabic and the English.*

### 1:20–1:45 — Why it matters

> "Every fact on that CV came from her own words. Nothing invented.
>
> It's bilingual — Arabic so she can read and verify it herself, English because that's the
> language of hiring across the Gulf. One document, both audiences.
>
> Naatiq doesn't just match people to jobs. It makes more people *matchable*."

*On screen: the CV side by side, then the dashboard counter rising, then the employer portal.*

### 1:45–2:00 — Close

> "Voice in. Career out. Naatiq."

*On screen: logo, WhatsApp number, join instructions.*

## 3. Five-minute live presentation

**0:00–0:45 — The problem.** Um Ahmad. Eleven years, no CV. The barrier is format, not skill. Name
the segments: domestic workers, drivers, tradespeople, salon technicians, kitchen staff.

**0:45–2:15 — Live demo.** Send a real voice note from a real phone, on screen. While the agent
replies, explain what is happening underneath — transcription, one warm question at a time,
structured extraction. Then the CV arrives. **Stop talking and let people look at it.**

**2:15–3:00 — Show it is real.** Open the dashboard: live counts, trade distribution, real CV
links. Then the employer portal: real profiles, filterable by trade, CVs downloadable, and no phone
numbers anywhere.

**3:00–4:00 — How it works.** Put up the architecture diagram. Keep it to four sentences: WhatsApp
via Twilio, Groq Whisper for Arabic speech, Claude for the interview and the CV, Gotenberg for
Arabic-correct PDFs, all on Supabase. Then make the two points that carry weight:

- **Arabic PDF rendering is the hard part.** Right-to-left, letters change shape by position, and
  most libraries get it wrong. Gotenberg wraps headless Chromium, so it inherits the browser's text
  engine. Solving this properly was the difference between a CV and an embarrassment.
- **Privacy is enforced in the schema.** First names come from a generated column and public roles
  have no permission to read full names at all. Phone numbers are never exposed. Employers request
  contact through Naatiq.

**4:00–4:40 — Honesty and roadmap.** State one real limitation before anyone asks: Arabic voice
replies are built and deployed but gated behind a paid TTS plan, so the agent's side still requires
reading — the literacy loop is only half closed. Then: dialect breadth, more languages, job
matching, and signed CV URLs before production.

**4:40–5:00 — Close.** *Voice in. Career out.* Marginal cost is a few cents per CV, which is why it
can reach an audience that cannot pay.

## 4. Questions to expect

**"How do you know it isn't making things up?"** The CV writer is explicitly prohibited from
inventing employers, dates, skills, tools or achievements, and is permitted only three
transformations: professionalise wording, fix grammar, infer an obvious job title. Below the
prompt, a code-level merge falls back to the raw interview data field by field, so every line is
traceable to something the worker said.

**"Why WhatsApp?"** Because it is already installed, already used daily, and voice notes are the
native register for this audience. Any other channel reintroduces a barrier.

**"What about other languages?"** The architecture is language-agnostic — the prompts and the
transcription language are configuration. Urdu, Hindi, Bengali, Tagalog and Amharic are the
realistic next set, and are the largest untapped part of the audience.

**"How does the worker know the CV is accurate?"** They receive the Arabic version, in their own
language, and can read or have it read to them. Editing is not yet supported — that is a known gap.

**"Is this ready for production?"** No, and the gaps are documented rather than hidden: private CV
storage with signed URLs, Twilio signature verification, explicit consent, a deletion path, and
rate limiting. The core loop is proven; the hardening is not done.

**"What did you build versus configure?"** Two Edge Functions, two production prompts, four
migrations with a schema-level privacy model, a bilingual CV template, three front-end surfaces,
and a self-hosted PDF service. The self-test diagnostic tooling found four production bugs.

## 5. Failure plan

Live demos fail. Have all of it ready before walking on stage.

- **Record the full happy path as video beforehand.** If anything stalls, play it. Never debug in
  front of an audience.
- **Have a completed CV PDF open in a tab** so the artefact can be shown even if nothing else works.
- **The dashboard already degrades gracefully** — it renders from embedded snapshot data instantly
  and overlays live values, so a bad network shows slightly stale numbers rather than an error.
- **Warm up Gotenberg** a few minutes before presenting; a sleeping free-tier container adds cold
  start latency.
- **Rejoin the Twilio sandbox from the demo phone** on the day. Join codes expire, and this is the
  single most likely thing to break.
- **Run one full end-to-end conversation an hour before** — it is the only real check that
  everything still works.
