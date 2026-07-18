# Testing Evidence and Limitations
> What has actually been proven to work, how it was proven, and everything that has not

## 1. The headline result

**A real person sent an Arabic voice note over WhatsApp and received a professional bilingual PDF
CV back, with no human intervention at any point in the chain.**

That is the whole product thesis, and it is validated rather than asserted.

## 2. The end-to-end run

Conducted on 18 July 2026 with a real user on a real phone.

| Stage | Result |
|---|---|
| Voice note received via Twilio | Media downloaded successfully |
| Groq Whisper transcription | Jordanian dialect transcribed accurately |
| Interview | 12 messages, one question at a time, warm colloquial Arabic throughout |
| Extraction | Complete structured profile built incrementally across turns |
| CV content | Claude produced parallel English and Modern Standard Arabic |
| PDF rendering | Gotenberg rendered correct Arabic shaping and RTL layout |
| Storage | Uploaded to the `cvs` bucket, path written to `profiles.cv_pdf_path` |
| Delivery | 152 KB PDF received in the WhatsApp thread |
| Final state | `state = cv_sent` |

**The profile extracted:** كرم شهودة — private driver — three employers, approximately five years
each — defensive driving, passenger safety, route planning, vehicle maintenance — and an
achievement about stopping an attempted car theft on a desert road and getting the family home
safely.

**What the CV writer did with it:** correctly inferred *fifteen years of experience across three
companies* from three five-year entries — an inference from the data, not an invention — and led
the summary with that figure. The achievement was written up in professional language in both
languages. **Nothing in the CV was fabricated; every fact traces to something the worker said.**

The user confirmed during the interview that the agent was "understanding me correctly."

## 3. Component-level verification

**Interview quality.** Verified in live use: one question per message, dialect maintained, prior
answers acknowledged, no repeated questions, and completion triggered at the right moment rather
than mid-conversation.

**Arabic PDF rendering.** The highest-risk component, verified early and separately via
`cv/preview/render_preview.py`, which renders the template locally with sample data. This allowed
layout and typography to be iterated in seconds instead of through WhatsApp round trips, and
confirmed correct letter shaping before any of it was wired up.

**Privacy controls.** Actively tested, not assumed. The anonymous role was queried directly and
confirmed **unable** to read `full_name`, `users`, `conversations` or `matches`. Supabase's advisor
was run and its `security_definer_view` finding was fixed and re-verified.

**Front-end surfaces.** Dashboard, landing page and employer portal were each loaded and confirmed
to render live data, in both Arabic and English, including CV links and the trade chart.

**Architecture diagram.** Reviewed visually and spell-checked.

**Documentation.** Every PDF in this set was rendered and a sample inspected visually.

## 4. Bugs found by testing, and how

Each of these was found by a real person using the product or by the self-test endpoint — none by
reading code.

| Bug | Symptom | Found by | Cause |
|---|---|---|---|
| `temperature` rejected | Silent pipeline failure | `&claude=1` | Claude Sonnet rejects the parameter |
| Twilio 63007 | No outbound messages | `&sendto=` | `TWILIO_WHATSAPP_FROM` not WhatsApp-enabled |
| Gotenberg unreachable | No CV delivered | `&cvtest=` | URL configured without `https://` |
| ElevenLabs 402 | Text replies only | `&ttstest=1` | Voice library needs a paid plan |
| `security_definer_view` | — | Supabase advisor | Views missing `security_invoker = true` |
| Dashboard "failed to fetch" | Demo data shown | User report | Key and view configuration |
| No CV link on dashboard | User report | User report | `cv_pdf_path` not exposed in the view |

The pattern is worth stating: **the self-test endpoint found four production bugs in minutes each,
after hours had been spent guessing at a black box.** Building observability was the highest-return
decision of the project.

## 5. What has *not* been tested

Stated plainly, because an untested claim is not evidence.

- **Scale.** The system has handled a handful of conversations. It has never seen concurrent users,
  and there is no load testing, rate limiting, or queueing.
- **Dialect breadth.** Validated on Jordanian/Levantine Arabic. Gulf, Egyptian and Maghrebi dialects
  are untested, and Maghrebi in particular is likely to be the hardest for transcription.
- **Poor audio conditions.** All test recordings were reasonably clear. Street noise, workshops,
  vehicle interiors and low-end microphones — the actual conditions of the target audience — are
  untested.
- **Long and rambling voice notes.** Only short, focused answers have been exercised. History is
  truncated to the last ten turns, so very long conversations may lose early context.
- **Adversarial input.** Prompt-injection defences are implemented and reasoned about, but have not
  been red-teamed.
- **Interrupted conversations.** A user who abandons the interview and returns days later has not
  been tested.
- **The employer side end to end.** Browsing and CV links work; no real employer has used the portal
  to hire anyone.
- **Placement recording.** The table and counter exist; no real placement has been recorded.
- **Cross-device WhatsApp rendering.** The PDF has been confirmed delivered, but not visually
  inspected across a range of Android and iOS WhatsApp PDF viewers.
- **Automated tests.** There is no test suite. All verification was manual. This is an explicit
  hackathon trade-off, and it is the first thing to add if the project continues.

## 6. Functional limitations

- **Voice replies are disabled.** Built and deployed behind a flag; blocked by the ElevenLabs free
  plan. Until it is enabled, the agent's side of the conversation still requires reading, which
  leaves the literacy loop only half closed. **This is the most important functional gap in the
  product.**
- **Job matching is not implemented.** The `matches` table exists; nothing populates it.
- **Mock interview practice is not built.** The `practice_mode` state exists as a placeholder.
- **No CV editing.** A user who wants a change must start over; there is no way to correct a field.
- **Arabic only.** No support for the other first languages common among migrant workers in the
  region — Urdu, Hindi, Bengali, Tagalog, Amharic — which excludes a large part of the intended
  audience.
- **Single CV format.** One template, no variants by trade or by employer preference.
- **Sandbox channel.** Users must send a join code before their first message, which is real
  friction and would not survive contact with a general audience. Production WhatsApp access
  requires Meta Business verification.

## 7. Honest assessment

**What is genuinely proven:** the core loop works. Voice in, professional bilingual CV out, over
WhatsApp, with no human in the middle and nothing fabricated. The hardest technical risk — Arabic
PDF rendering — is solved properly rather than worked around. Privacy is enforced at the schema
level and was verified by testing rather than assumed. The marginal cost is a few cents per CV,
which means the economics work for an audience that cannot pay.

**What is not yet proven:** that it holds up at scale, across dialects, in noisy real-world audio,
or in the hands of employers who have never seen it. Those are the next things to test, in that
order.
