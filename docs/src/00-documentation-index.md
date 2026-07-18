# Documentation Index
> The complete Naatiq documentation set — what each document covers and who it is for

## About Naatiq

**Naatiq (ناطق)** is a voice-first WhatsApp agent that turns an Arabic voice note into a
professional bilingual PDF CV, for workers the CV economy excludes — domestic workers, drivers,
tradespeople, salon technicians, kitchen staff.

The name means *"articulate"* or *"speaking"*. The product was originally called *Wathefti
(وظيفتي)*; the rename is reflected throughout this set.

## The documents

| # | Document | Read it if you want to know… |
|---|---|---|
| 01 | **Executive Summary** | What Naatiq is and why it matters, in two minutes |
| 02 | **Product Requirements (v2)** | Scope, goals, what shipped and what did not |
| 03 | **Target Audience** | Who it serves, which trades, and why WhatsApp voice |
| 04 | **Technical Documentation** | Architecture, data model, request flow, components |
| 05 | **Product System Prompts** | The two production prompts, verbatim, with rationale |
| 06 | **Building with AI** | How it was built, the prompts used, what went wrong |
| 07 | **Tools and Stack** | Every service and library, why chosen, what it costs |
| 08 | **Security and Privacy** | Data held, controls, trade-offs, production checklist |
| 09 | **Setup and Runbook** | Deploying from scratch; diagnosing failures |
| 10 | **Testing and Limitations** | What is proven, how, and everything that is not |
| 11 | **Demo Script** | Two-minute video and five-minute presentation |

## Suggested reading paths

**Judges and reviewers:** 01, then 10, then 06. The summary establishes the idea, the testing
document shows what is genuinely proven rather than claimed, and the build narrative shows the
working method — including the mistakes.

**Engineers:** 04, then 05, then 09. Architecture, then the prompts that are the actual product,
then how to run it.

**Anyone assessing risk:** 08, then 10. The privacy trade-offs are stated explicitly, as are the
untested areas.

**Anyone presenting it:** 11, with 01 for the framing and 10 for the honest answers to hard
questions.

## Other artefacts in this repository

- `docs/naatiq-architecture.svg` / `.png` — the system diagram.
- `cv/naatiq-cv-sample.pdf` — a real generated CV.
- `dashboard/index.html` — the live impact dashboard.
- `web/index.html`, `web/employers.html` — landing page and employer portal.

## How this documentation is maintained

The Markdown files in `docs/src/` are the **source of truth**. The PDFs in `docs/pdf/` are build
artefacts and should never be edited by hand — edit the Markdown and regenerate:

```
pip install markdown weasyprint pillow --break-system-packages
python3 docs/build_docs.py
```
