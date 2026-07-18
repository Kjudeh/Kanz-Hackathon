# Executive Summary
> Naatiq (ناطق) — a voice-first WhatsApp career agent for workers the CV economy leaves behind

## The problem

A large share of the workforce has years of real, valuable experience and no CV. Domestic
workers, drivers, salon technicians, electricians, plumbers, cooks, delivery riders, security
guards. Not because the experience isn't there, but because **every CV tool ever built assumes
literacy, a laptop, typing ability and comfort with forms.**

These are precisely the people national skilling and employability efforts are trying to reach,
and precisely the people the existing tooling excludes. The barrier isn't skill. It's format.

## What Naatiq does

A worker sends a WhatsApp voice note in their own Arabic dialect. Naatiq interviews them
conversationally — one warm question at a time — extracts a structured profile, and sends back a
professional **bilingual (Arabic + English) PDF CV**.

No app to install. No form to fill in. No reading or typing required. The whole experience happens
in a single WhatsApp thread on any phone.

## How it works

1. **Send a voice note.** Talk about your work in your own dialect, like telling a friend.
2. **Answer a few simple questions.** One at a time — name, trade, where you've worked, what
   you're good at, something you're proud of.
3. **Receive your CV.** A bilingual PDF arrives on WhatsApp, ready to send to any employer.

## It works — and here is the proof

This is not a mockup. On 18 July 2026 a full conversation ran end to end with a real person:

- A voice note in Jordanian dialect was transcribed correctly by Groq Whisper.
- Claude interviewed him across 12 messages, one question at a time, in warm colloquial Arabic.
- It extracted a complete structured profile: **كرم شهودة**, private driver, three employers
  (5 years each), defensive-driving and passenger-safety skills, plus a story about stopping an
  attempted car theft in the desert and keeping the family safe.
- The CV writer turned that into a polished bilingual CV — correctly inferring **15 years of
  experience across three companies** — with a full Modern Standard Arabic column.
- Gotenberg rendered it, it was stored, and a 152 KB PDF was delivered back on WhatsApp.

Nothing in the CV was fabricated. Every fact came from the worker's own words.

## Why it matters

Naatiq doesn't just match people to jobs — **it makes more people matchable.** Every completed
profile is a person who can now be searched, assessed and hired, who previously could not be.
That is the number the impact dashboard leads with: *people who have a CV today who didn't before.*

## Status

Fully built, deployed and proven end to end. The WhatsApp agent, bilingual CV generation, the
impact dashboard, a public landing page and an employer portal are all live. Everything runs
serverless on free tiers, with no manual steps during a demo.

## Stack

Supabase (Postgres, Storage, Edge Functions) · Claude Sonnet for the interview and the CV ·
Groq Whisper for Arabic speech-to-text · Gotenberg for Arabic-correct PDF rendering ·
Twilio WhatsApp as the channel.
