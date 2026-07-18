# Tools and Stack
> Every service and library used, what it does, why it was chosen, and what it cost

## 1. Selection principles

Four rules governed every choice:

1. **Free tier or self-hosted.** The whole system had to run at zero cost.
2. **No servers to babysit.** Everything serverless or containerised, so nothing has to be
   restarted mid-demo.
3. **Arabic-correct or rejected.** Any component that renders or understands Arabic had to do so
   properly. This ruled out several otherwise-attractive options.
4. **Deploy in seconds.** With an eight-day budget, slow deploys are the real cost.

## 2. Runtime and platform

### Supabase — database, storage, functions
Postgres for all data, Storage for CVs, Edge Functions for both backend services, and row-level
security for access control. Chosen because it collapses four separate services into one, deploys
Deno functions in seconds, and its Postgres is fully standard — generated columns, `security_invoker`
views and column-level grants all work as expected, which is what makes the privacy model
enforceable at the schema level. Free tier.

### Deno — Edge Function runtime
The runtime Supabase Edge Functions provide. TypeScript with no build step, web-standard `fetch`,
and `EdgeRuntime.waitUntil` for background work after a response is returned — which is exactly
what the fast-acknowledge webhook pattern needs.

### Railway — Gotenberg hosting
Hosts the single container that is not serverless. Deploys straight from a Dockerfile, injects
`$PORT`, and stays inside the free allowance at this volume.

### GitHub — source control
Everything committed and pushed to `github.com/Kjudeh/Kanz-Hackathon`.

## 3. AI services

### Claude Sonnet — interviewer and CV writer
Both LLM roles. Chosen for three properties this product depends on: **Arabic fluency in both
dialect and Modern Standard Arabic**, **reliable strict-JSON output** so one call can return a
human reply and a machine-readable extraction together, and **strong instruction-following** for
the no-fabrication rules that make the CV trustworthy.

*Constraint discovered in production:* this model **rejects the `temperature` parameter** and
returns a 400 if it is sent. Both clients omit it deliberately.

### Groq Whisper (`whisper-large-v3`) — Arabic speech-to-text
Transcribes voice notes with `language: "ar"`. Chosen for dialect handling — it copes with Gulf and
Levantine speech rather than only formal Arabic — and for latency, which on Groq's inference
hardware is low enough that the round trip feels conversational. Generous free tier.

### ElevenLabs — Arabic text-to-speech (built, disabled)
Would let the agent reply in voice as well as text, closing the literacy loop completely. Fully
implemented in `tts.ts` and deployed behind `WATHEFTI_VOICE_REPLIES`. Disabled because **API access
to the voice library requires a paid plan** — the free tier returns HTTP 402 regardless of which
voice ID is used. Flip the flag on a paid plan and it works with no code change.

## 4. Messaging

### Twilio WhatsApp (Sandbox)
The channel. Inbound messages arrive as a webhook POST; outbound text and media go via the REST
API. The sandbox was chosen because production WhatsApp access requires Meta Business verification,
which takes far longer than eight days. Users opt in by sending a join code once.

Two hard-won details: `TWILIO_WHATSAPP_FROM` **must** carry the `whatsapp:` prefix or Twilio returns
error 63007, and media downloads require HTTP basic auth with the account SID and auth token.

## 5. PDF rendering

### Gotenberg — HTML to PDF
The most carefully considered choice in the stack, because **Arabic PDF rendering is the highest
technical risk in the product**. Arabic is right-to-left and its letters change shape depending on
position in a word. Most PDF libraries either reverse the string or emit disconnected letterforms.
A CV with broken Arabic is worse than no CV — it looks careless, and the worker cannot tell.

Gotenberg wraps **headless Chromium**, so it inherits the browser's text-shaping and bidirectional
layout engine: the most battle-tested Arabic rendering available anywhere. It is self-hosted from
`infra/gotenberg/Dockerfile`, so it is infrastructure rather than a vendor dependency.

**Alternatives rejected:** *WeasyPrint* — does not shape Arabic reliably. *pdfmake / jsPDF* —
require manual RTL handling and font subsetting. *Hosted HTML-to-PDF APIs* — add cost and put a
third party in the critical path of the single most important artefact in the product. *Puppeteer
in a function* — Chromium does not fit in an Edge Function.

## 6. Front end

Three self-contained HTML files with **no build step and no framework** — no npm install, no
bundler, nothing to break on demo day. Each is a single file that can be opened locally or served
statically, reading Supabase views over the REST API with the publishable key.

- **Chart.js** (CDN) — the trade-distribution chart on the dashboard.
- **Cairo / Amiri** — Arabic typefaces, embedded.
- **Lato** — Latin typeface, embedded.

Fonts are embedded rather than linked so a PDF renders identically regardless of host fonts.

## 7. Documentation toolchain

- **Python + Markdown + WeasyPrint** — `docs/build_docs.py` renders every `docs/src/*.md` into a
  branded PDF. The Markdown is the source of truth; PDFs are regenerated, never hand-edited.
  WeasyPrint is fine here because these documents are Latin-script.
- **CairoSVG** — rasterises the architecture diagram from SVG to PNG.
- **Pillow** — logo processing for the PDF header.

## 8. Build environment

Claude in Cowork, with tool access to Supabase (schema, functions, SQL), GitHub, a Linux shell and
the web. Every external connection was explicitly approved before being made.

## 9. Cost

| Service | Tier | Cost |
|---|---|---|
| Supabase | Free | $0 |
| Twilio WhatsApp | Sandbox | $0 |
| Groq | Free | $0 |
| Anthropic | Pay-as-you-go | Cents per CV |
| Railway (Gotenberg) | Free allowance | $0 |
| ElevenLabs | Free (feature disabled) | $0 |
| GitHub | Free | $0 |

**Marginal cost per CV: a few cents of inference.** Everything else is fixed and free at this
volume. This matters beyond the hackathon: the economics work for an audience that cannot pay,
which is the only way a product like this reaches the people it is for.
