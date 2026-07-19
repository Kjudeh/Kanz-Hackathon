# Naatiq — Documentation

**Naatiq (ناطق)** turns an Arabic voice note into a professional bilingual PDF CV, over WhatsApp,
for workers the CV economy excludes.

## Read the PDFs

Branded PDFs live in [`pdf/`](pdf/). One file per document.

| # | Document | Covers |
|---|---|---|
| 00 | [Documentation Index](pdf/00-documentation-index.pdf) | What each document is and suggested reading paths |
| 01 | [Executive Summary](pdf/01-executive-summary.pdf) | The problem, the product, the proof |
| 02 | [Product Requirements (v2)](pdf/02-prd.pdf) | Scope, goals, what shipped and what did not |
| 03 | [Target Audience](pdf/03-target-audience.pdf) | Who it serves, which trades, why WhatsApp voice |
| 04 | [Technical Documentation](pdf/04-technical-documentation.pdf) | Architecture, data model, flow, components |
| 05 | [Product System Prompts](pdf/05-product-system-prompts.pdf) | The two production prompts, verbatim, with rationale |
| 06 | [Building with AI](pdf/06-building-with-ai.pdf) | Build-session prompts, method, mistakes |
| 07 | [Tools and Stack](pdf/07-tools-and-stack.pdf) | Every service and library, why chosen, cost |
| 08 | [Security and Privacy](pdf/08-security-and-privacy.pdf) | Data, controls, trade-offs, production checklist |
| 09 | [Setup and Runbook](pdf/09-setup-and-runbook.pdf) | Deploy from scratch; diagnose failures |
| 10 | [Testing and Limitations](pdf/10-testing-and-limitations.pdf) | What is proven, and what is not |
| 11 | [Demo Script](pdf/11-demo-script.pdf) | Two-minute video and five-minute presentation |
| 12 | [Build Prompt Log](pdf/12-build-prompt-log.pdf) | Every instruction given during the build, verbatim and in order |

**On the three prompt documents:** **05** is what runs in production, **12** is what the human
typed to build it, and **06** is the narrative connecting the two.

## Other artefacts

- [`naatiq-architecture.svg`](naatiq-architecture.svg) / [`.png`](naatiq-architecture.png) — system diagram
- [`../cv/naatiq-cv-sample.pdf`](../cv/naatiq-cv-sample.pdf) — a real generated CV
- [`../dashboard/index.html`](../dashboard/index.html) — impact dashboard
- [`../web/index.html`](../web/index.html) — landing page
- [`../web/employers.html`](../web/employers.html) — employer portal

## Editing

The Markdown in [`src/`](src/) is the **source of truth**. PDFs are build artefacts — never edit
them by hand.

```bash
pip install markdown weasyprint pillow --break-system-packages
python3 docs/build_docs.py
```

Each `src/*.md` file starts with a `# Title` and an optional `> subtitle`, which become the PDF
cover block. Add a new document by dropping a numbered Markdown file into `src/` and re-running the
build.
