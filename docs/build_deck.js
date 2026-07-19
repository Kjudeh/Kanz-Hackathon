const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";                      // 13.3 x 7.5
const W = 13.3, H = 7.5, M = 0.7;

// Naatiq brand palette
const NAVY = "0F1B3D", BLUE = "2F5FFF", GREEN = "16C89A",
      MUTED = "5B6472", SURFACE = "F3F5F9", LINE = "E7EAEF",
      WHITE = "FFFFFF", ICE = "BFCCE5", DIM = "A6ADB8";
const F = "Calibri";

p.author = "Karam Judeh, Rahma Al Sharif, Abderrahim Laghmari";
p.company = "Naatiq";
p.title = "Naatiq — voice-first hiring for the workers your database can't see";

const shadow = () => ({ type: "outer", color: "0F1B3D", blur: 14, offset: 3, angle: 90, opacity: 0.10 });

// ---------- reusable pieces ----------
function darkSlide() {
  const s = p.addSlide();
  s.background = { color: NAVY };
  return s;
}
function lightSlide(kicker, title, sub) {
  const s = p.addSlide();
  s.background = { color: WHITE };
  if (kicker) s.addText(kicker.toUpperCase(), {
    x: M, y: 0.42, w: 10, h: 0.28, fontFace: F, fontSize: 11, bold: true,
    color: BLUE, charSpacing: 2, margin: 0
  });
  s.addText(title, {
    x: M, y: 0.72, w: W - M * 2, h: 0.72, fontFace: F, fontSize: 34, bold: true,
    color: NAVY, margin: 0
  });
  if (sub) s.addText(sub, {
    x: M, y: 1.46, w: W - M * 2 - 0.6, h: 0.5, fontFace: F, fontSize: 15,
    color: MUTED, margin: 0
  });
  return s;
}
// tinted rounded card
function card(s, x, y, w, h, fill) {
  s.addShape(p.ShapeType.roundRect, {
    x, y, w, h, fill: { color: fill || SURFACE }, rectRadius: 0.14,
    line: { color: LINE, width: 1 }, shadow: shadow()
  });
}
// numbered circle
function circle(s, x, y, d, label, bg, fg) {
  s.addShape(p.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: bg }, line: { color: bg } });
  s.addText(label, {
    x, y, w: d, h: d, fontFace: F, fontSize: 14, bold: true, color: fg || WHITE,
    align: "center", valign: "middle", margin: 0
  });
}
function footer(s, n) {
  s.addText("Naatiq", { x: M, y: H - 0.5, w: 2, h: 0.25, fontFace: F, fontSize: 9, color: DIM, margin: 0 });
  s.addText(String(n), { x: W - M - 1, y: H - 0.5, w: 1, h: 0.25, fontFace: F, fontSize: 9, color: DIM, align: "right", margin: 0 });
}

// =====================================================================
// 1 — title
// =====================================================================
{
  const s = darkSlide();
  s.addShape(p.ShapeType.roundRect, { x: M, y: 2.15, w: 0.72, h: 0.72, fill: { color: GREEN }, rectRadius: 0.16, line: { color: GREEN } });
  s.addText("N", { x: M, y: 2.15, w: 0.72, h: 0.72, fontFace: F, fontSize: 30, bold: true, color: NAVY, align: "center", valign: "middle", margin: 0 });
  s.addText("Naatiq", { x: M + 0.95, y: 2.18, w: 6, h: 0.7, fontFace: F, fontSize: 40, bold: true, color: WHITE, margin: 0 });
  s.addText("Voice in. Career out.", { x: M, y: 3.25, w: 11, h: 0.8, fontFace: F, fontSize: 44, bold: true, color: WHITE, margin: 0 });
  s.addText("A voice-first hiring pipeline for the workers your database cannot see.",
    { x: M, y: 4.15, w: 9.6, h: 0.5, fontFace: F, fontSize: 17, color: ICE, margin: 0 });
  s.addText("Designed and built end to end with Claude Cowork.",
    { x: M, y: 4.78, w: 9.6, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: GREEN, margin: 0 });
  s.addText("Karam Judeh   ·   Rahma Al Sharif   ·   Abderrahim Laghmari",
    { x: M, y: 6.45, w: 9, h: 0.3, fontFace: F, fontSize: 12, color: DIM, margin: 0 });
  s.addNotes("One line: we turn a WhatsApp voice note into a structured, searchable candidate profile — for the part of the workforce that has experience but no CV.");
}

// =====================================================================
// 2 — the invisible workforce
// =====================================================================
{
  const s = lightSlide("The problem", "The workforce you cannot search",
    "Domestic workers, drivers, cooks, electricians, salon technicians, delivery riders, security guards.");
  const items = [
    ["No CV", "Ten or more years of real experience, none of it documented anywhere."],
    ["No digital footprint", "Not on LinkedIn, not in a job board, not in your ATS."],
    ["Found only by referral", "Every new job restarts their reputation from zero."]
  ];
  items.forEach((it, i) => {
    const x = M + i * 4.1;
    card(s, x, 2.35, 3.8, 2.5);
    circle(s, x + 0.32, 2.7, 0.5, String(i + 1), BLUE);
    s.addText(it[0], { x: x + 0.32, y: 3.35, w: 3.1, h: 0.35, fontFace: F, fontSize: 17, bold: true, color: NAVY, margin: 0 });
    s.addText(it[1], { x: x + 0.32, y: 3.75, w: 3.2, h: 0.9, fontFace: F, fontSize: 13, color: MUTED, margin: 0 });
  });
  s.addText("They are not a niche. In Gulf and Levant labour markets they are the majority of hires.",
    { x: M, y: 5.35, w: 11.5, h: 0.4, fontFace: F, fontSize: 15, italic: true, color: NAVY, margin: 0 });
  footer(s, 2);
  s.addNotes("Frame this as a supply problem the audience already feels: they cannot search what was never written down.");
}

// =====================================================================
// 3 — the format barrier
// =====================================================================
{
  const s = lightSlide("Why it persists", "The barrier is format, not skill");
  card(s, M, 2.2, 5.6, 3.1, SURFACE);
  s.addText("What the worker has", { x: M + 0.35, y: 2.5, w: 5, h: 0.35, fontFace: F, fontSize: 17, bold: true, color: NAVY, margin: 0 });
  s.addText([
    { text: "A decade of verifiable, specific experience", options: { bullet: true, breakLine: true } },
    { text: "Named employers and real durations", options: { bullet: true, breakLine: true } },
    { text: "Concrete skills, tools and achievements", options: { bullet: true, breakLine: true } },
    { text: "A smartphone and daily WhatsApp use", options: { bullet: true } }
  ], { x: M + 0.35, y: 2.95, w: 4.9, h: 2.1, fontFace: F, fontSize: 13.5, color: MUTED, paraSpaceAfter: 8, margin: 0 });

  card(s, M + 6.1, 2.2, 5.6, 3.1, "FFF1F0");
  s.addText("What every CV tool demands", { x: M + 6.45, y: 2.5, w: 5, h: 0.35, fontFace: F, fontSize: 17, bold: true, color: NAVY, margin: 0 });
  s.addText([
    { text: "Literacy in formal written language", options: { bullet: true, breakLine: true } },
    { text: "A laptop and a keyboard", options: { bullet: true, breakLine: true } },
    { text: "Comfort with abstract forms and fields", options: { bullet: true, breakLine: true } },
    { text: "Knowing what a CV is supposed to contain", options: { bullet: true } }
  ], { x: M + 6.45, y: 2.95, w: 4.9, h: 2.1, fontFace: F, fontSize: 13.5, color: MUTED, paraSpaceAfter: 8, margin: 0 });

  s.addText("Remove the format requirement and the supply was always there.",
    { x: M, y: 5.65, w: 11.5, h: 0.45, fontFace: F, fontSize: 18, bold: true, color: BLUE, margin: 0 });
  footer(s, 3);
}

// =====================================================================
// 4 — what it costs the business
// =====================================================================
{
  const s = lightSlide("The commercial cost", "What this costs a recruitment business",
    "The candidate's problem is also a margin problem.");
  const items = [
    ["Shallow pipelines", "High-volume trades are the hardest roles to fill and the thinnest part of your database."],
    ["Slow time-to-fill", "Sourcing runs on phone calls and personal networks that do not scale."],
    ["Unverifiable candidates", "No structured history means no shortlist, no comparison, no confidence."],
    ["Margin lost to manual work", "Consultants spend hours transcribing what a candidate said into something searchable."]
  ];
  items.forEach((it, i) => {
    const x = M + (i % 2) * 6.05, y = 2.3 + Math.floor(i / 2) * 1.65;
    card(s, x, y, 5.75, 1.42);
    circle(s, x + 0.28, y + 0.36, 0.44, "!", GREEN, NAVY);
    s.addText(it[0], { x: x + 0.92, y: y + 0.22, w: 4.6, h: 0.3, fontFace: F, fontSize: 15.5, bold: true, color: NAVY, margin: 0 });
    s.addText(it[1], { x: x + 0.92, y: y + 0.55, w: 4.65, h: 0.75, fontFace: F, fontSize: 12.5, color: MUTED, margin: 0 });
  });
  footer(s, 4);
  s.addNotes("This is the slide that makes it their problem rather than a charity pitch.");
}

// =====================================================================
// 5 — what Naatiq is
// =====================================================================
{
  const s = p.addSlide(); s.background = { color: NAVY };
  s.addText("WHAT IT IS", { x: M, y: 0.9, w: 6, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: GREEN, charSpacing: 2, margin: 0 });
  s.addText("A WhatsApp agent that turns a spoken conversation into a structured candidate profile.",
    { x: M, y: 1.35, w: 7.4, h: 1.9, fontFace: F, fontSize: 30, bold: true, color: WHITE, margin: 0 });
  s.addText("No app to install. No form to fill in. No literacy or typing required. The worker speaks in their own dialect; you receive searchable, comparable data and a professional bilingual CV.",
    { x: M, y: 3.45, w: 7.2, h: 1.4, fontFace: F, fontSize: 15, color: ICE, margin: 0 });
  const pills = ["Arabic voice", "Bilingual output", "Zero candidate cost"];
  pills.forEach((t, i) => {
    s.addShape(p.ShapeType.roundRect, { x: M + i * 2.45, y: 5.15, w: 2.25, h: 0.5, fill: { color: "1B2A52" }, rectRadius: 0.25, line: { color: "2A3A63" } });
    s.addText(t, { x: M + i * 2.45, y: 5.15, w: 2.25, h: 0.5, fontFace: F, fontSize: 12, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
  });
  // right visual
  s.addShape(p.ShapeType.roundRect, { x: 8.55, y: 1.35, w: 4.05, h: 4.6, fill: { color: "16234A" }, rectRadius: 0.18, line: { color: "2A3A63" } });
  const flow = ["Voice note on WhatsApp", "Transcribed in dialect", "Interviewed by AI", "Structured profile", "Bilingual CV returned"];
  flow.forEach((t, i) => {
    const y = 1.75 + i * 0.85;
    circle(s, 8.9, y, 0.4, String(i + 1), i === 4 ? GREEN : BLUE, i === 4 ? NAVY : WHITE);
    s.addText(t, { x: 9.45, y: y + 0.02, w: 3.0, h: 0.36, fontFace: F, fontSize: 12.5, color: WHITE, valign: "middle", margin: 0 });
  });
  footer(s, 5);
}

// =====================================================================
// 6 — how it works
// =====================================================================
{
  const s = lightSlide("How it works", "Four steps, all inside WhatsApp");
  const steps = [
    ["Talk", "The worker sends a voice note in their own Arabic dialect."],
    ["Understand", "Speech-to-text plus an AI interviewer that asks one warm question at a time."],
    ["Structure", "Name, trade, employers, durations, skills, tools and achievements — extracted into fields."],
    ["Deliver", "A bilingual PDF CV to the worker; a searchable profile to you."]
  ];
  steps.forEach((st, i) => {
    const x = M + i * 3.05;
    card(s, x, 2.4, 2.8, 2.75);
    circle(s, x + 0.3, 2.72, 0.52, String(i + 1), i === 3 ? GREEN : BLUE, i === 3 ? NAVY : WHITE);
    s.addText(st[0], { x: x + 0.3, y: 3.42, w: 2.3, h: 0.32, fontFace: F, fontSize: 17, bold: true, color: NAVY, margin: 0 });
    s.addText(st[1], { x: x + 0.3, y: 3.8, w: 2.25, h: 1.2, fontFace: F, fontSize: 12.5, color: MUTED, margin: 0 });
    if (i < 3) s.addText("›", { x: x + 2.82, y: 3.4, w: 0.24, h: 0.4, fontFace: F, fontSize: 22, bold: true, color: DIM, align: "center", margin: 0 });
  });
  s.addText("Median interaction: a few minutes of speaking, spread over a normal WhatsApp thread.",
    { x: M, y: 5.5, w: 11.5, h: 0.4, fontFace: F, fontSize: 14, italic: true, color: MUTED, margin: 0 });
  footer(s, 6);
}

// =====================================================================
// 7 — proof
// =====================================================================
{
  const s = lightSlide("Proof", "It works end to end — with a real person, on a real phone");
  card(s, M, 2.3, 7.2, 3.3);
  s.addText("A validated run", { x: M + 0.4, y: 2.6, w: 5, h: 0.32, fontFace: F, fontSize: 16, bold: true, color: NAVY, margin: 0 });
  s.addText([
    { text: "A voice note in Jordanian dialect, transcribed correctly", options: { bullet: true, breakLine: true } },
    { text: "Twelve messages of conversation, one question at a time", options: { bullet: true, breakLine: true } },
    { text: "Extracted: private driver, three employers, defensive driving and passenger safety, plus a specific achievement", options: { bullet: true, breakLine: true } },
    { text: "Correctly inferred fifteen years of experience across three companies", options: { bullet: true, breakLine: true } },
    { text: "Bilingual PDF delivered back on WhatsApp in minutes", options: { bullet: true } }
  ], { x: M + 0.4, y: 3.05, w: 6.4, h: 2.3, fontFace: F, fontSize: 13, color: MUTED, paraSpaceAfter: 7, margin: 0 });

  card(s, M + 7.6, 2.3, 3.9, 3.3, NAVY);
  s.addText("Nothing was invented.", { x: M + 7.9, y: 2.75, w: 3.3, h: 0.8, fontFace: F, fontSize: 21, bold: true, color: WHITE, margin: 0 });
  s.addText("Every line of the CV traces back to something the worker actually said. The CV writer is explicitly forbidden from adding employers, dates or skills, and falls back to the raw interview if the model omits a field.",
    { x: M + 7.9, y: 3.6, w: 3.3, h: 1.8, fontFace: F, fontSize: 12.5, color: ICE, margin: 0 });
  s.addText("Status: validated at pilot scale. Not yet load-tested or proven across all dialects.",
    { x: M, y: 5.85, w: 11.5, h: 0.35, fontFace: F, fontSize: 12.5, italic: true, color: MUTED, margin: 0 });
  footer(s, 7);
  s.addNotes("Say the honesty line out loud. Executives discount decks that claim scale they do not have.");
}

// =====================================================================
// 8 — what the employer gets
// =====================================================================
{
  const s = lightSlide("The asset", "What you get: a structured, searchable talent pool",
    "Every conversation becomes a record you can filter, shortlist and compare.");
  const fields = ["Occupation, normalised", "Years of experience", "Named employers and durations",
                  "Skills and tools", "Achievements in their words", "Bilingual CV, ready to send"];
  fields.forEach((t, i) => {
    const x = M + (i % 3) * 4.05, y = 2.45 + Math.floor(i / 3) * 1.15;
    card(s, x, y, 3.75, 0.92, SURFACE);
    circle(s, x + 0.26, y + 0.24, 0.44, "✓", GREEN, NAVY);
    s.addText(t, { x: x + 0.88, y: y + 0.2, w: 2.7, h: 0.55, fontFace: F, fontSize: 13, bold: true, color: NAVY, valign: "middle", margin: 0 });
  });
  card(s, M, 4.95, 11.6, 1.05, NAVY);
  s.addText("Free-text trades are grouped automatically — \"driver\", \"private driver\" and \"سائق خاص\" resolve to one searchable occupation.",
    { x: M + 0.4, y: 5.15, w: 10.8, h: 0.65, fontFace: F, fontSize: 14, color: WHITE, valign: "middle", margin: 0 });
  footer(s, 8);
}

// =====================================================================
// 9 — defensibility
// =====================================================================
{
  const s = lightSlide("Defensibility", "Four things that are harder than they look");
  const items = [
    ["Dialect, not textbook Arabic", "Workers speak Gulf and Levantine dialect. Transcription and the interview persona are both tuned for it."],
    ["Arabic that renders correctly", "Right-to-left text whose letters change shape by position. Most PDF tooling gets this visibly wrong; we render through a browser engine."],
    ["Truthfulness as a constraint", "A padded CV costs a worker their credibility and you your client. Non-fabrication is enforced in the prompt and again in code."],
    ["Privacy built into the schema", "Public surfaces physically cannot read a full name or phone number — enforced by column grants, not by good intentions."]
  ];
  items.forEach((it, i) => {
    const x = M + (i % 2) * 6.05, y = 2.25 + Math.floor(i / 2) * 1.8;
    card(s, x, y, 5.75, 1.6);
    s.addText(it[0], { x: x + 0.35, y: y + 0.22, w: 5.1, h: 0.32, fontFace: F, fontSize: 15.5, bold: true, color: BLUE, margin: 0 });
    s.addText(it[1], { x: x + 0.35, y: y + 0.6, w: 5.1, h: 0.9, fontFace: F, fontSize: 12.5, color: MUTED, margin: 0 });
  });
  footer(s, 9);
}

// =====================================================================
// 10 — how it fits
// =====================================================================
{
  const s = lightSlide("Integration", "How it fits your existing operation",
    "Naatiq is an intake layer, not a replacement for your ATS.");
  const boxes = [
    ["Candidate", "WhatsApp voice note", SURFACE, NAVY],
    ["Naatiq", "Transcribe · interview · structure · generate", NAVY, WHITE],
    ["Your business", "Search the pool · shortlist · contact · place", SURFACE, NAVY]
  ];
  boxes.forEach((b, i) => {
    const x = M + i * 4.1;
    card(s, x, 2.6, 3.6, 1.9, b[2]);
    s.addText(b[0], { x: x + 0.3, y: 2.85, w: 3, h: 0.35, fontFace: F, fontSize: 17, bold: true, color: b[3], margin: 0 });
    s.addText(b[1], { x: x + 0.3, y: 3.25, w: 3.05, h: 1.0, fontFace: F, fontSize: 12.5, color: i === 1 ? ICE : MUTED, margin: 0 });
    if (i < 2) s.addText("→", { x: x + 3.62, y: 3.3, w: 0.45, h: 0.4, fontFace: F, fontSize: 20, bold: true, color: BLUE, align: "center", margin: 0 });
  });
  s.addText("Runs serverless. No infrastructure for you to host, and the marginal cost of one profile is a few cents of compute.",
    { x: M, y: 4.95, w: 11.5, h: 0.4, fontFace: F, fontSize: 14, color: MUTED, margin: 0 });
  card(s, M, 5.5, 11.6, 0.95, SURFACE);
  s.addText("Delivery options:  hosted portal  ·  data export into your ATS  ·  API access  ·  fully white-labelled",
    { x: M + 0.4, y: 5.68, w: 10.8, h: 0.6, fontFace: F, fontSize: 13.5, bold: true, color: NAVY, valign: "middle", margin: 0 });
  footer(s, 10);
}

// =====================================================================
// 11 — monetization principle
// =====================================================================
{
  const s = p.addSlide(); s.background = { color: NAVY };
  s.addText("MONETIZATION", { x: M, y: 1.1, w: 6, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: GREEN, charSpacing: 2, margin: 0 });
  s.addText("Employers pay. Candidates never do.", { x: M, y: 1.6, w: 11.5, h: 0.9, fontFace: F, fontSize: 38, bold: true, color: WHITE, margin: 0 });
  s.addText("This is a commercial decision as much as an ethical one. Charging a worker who has no CV is charging the person with the least ability to pay — and it collapses the supply side that makes the pool valuable in the first place.",
    { x: M, y: 2.75, w: 8.6, h: 1.2, fontFace: F, fontSize: 15, color: ICE, margin: 0 });
  const cols = [
    ["Free forever", "Candidates: interview, CV, updates and re-issues."],
    ["Paid", "Employers and agencies: access, tooling, integration and outcomes."],
    ["Funded", "Programmes and sponsors: reach, cohorts and reporting."]
  ];
  cols.forEach((c, i) => {
    const x = M + i * 3.95;
    s.addShape(p.ShapeType.roundRect, { x, y: 4.35, w: 3.6, h: 1.7, fill: { color: "16234A" }, rectRadius: 0.14, line: { color: "2A3A63" } });
    s.addText(c[0], { x: x + 0.3, y: 4.6, w: 3, h: 0.35, fontFace: F, fontSize: 16, bold: true, color: i === 0 ? GREEN : WHITE, margin: 0 });
    s.addText(c[1], { x: x + 0.3, y: 5.0, w: 3.05, h: 0.85, fontFace: F, fontSize: 12.5, color: ICE, margin: 0 });
  });
  footer(s, 11);
}

// =====================================================================
// 12 — model 1
// =====================================================================
{
  const s = lightSlide("Revenue model 1", "Subscription access to the pool",
    "The recurring core. Predictable revenue, and it compounds as the pool grows.");
  card(s, M, 2.35, 5.6, 3.4);
  s.addText("What the buyer gets", { x: M + 0.35, y: 2.62, w: 5, h: 0.32, fontFace: F, fontSize: 16, bold: true, color: NAVY, margin: 0 });
  s.addText([
    { text: "Search and filter the full candidate pool", options: { bullet: true, breakLine: true } },
    { text: "Open and download bilingual CVs", options: { bullet: true, breakLine: true } },
    { text: "Request contact through the platform", options: { bullet: true, breakLine: true } },
    { text: "Saved searches and alerts for new matching profiles", options: { bullet: true, breakLine: true } },
    { text: "Seats for the consultants who need them", options: { bullet: true } }
  ], { x: M + 0.35, y: 3.05, w: 5.0, h: 2.4, fontFace: F, fontSize: 13, color: MUTED, paraSpaceAfter: 7, margin: 0 });

  card(s, M + 6.05, 2.35, 5.55, 3.4, SURFACE);
  s.addText("Why it fits this market", { x: M + 6.4, y: 2.62, w: 5, h: 0.32, fontFace: F, fontSize: 16, bold: true, color: NAVY, margin: 0 });
  s.addText([
    { text: "Agencies already budget for database and job-board subscriptions", options: { bullet: true, breakLine: true } },
    { text: "Value rises every month as more workers join — churn falls as the pool deepens", options: { bullet: true, breakLine: true } },
    { text: "Tiering is natural: by seats, by regions, or by number of occupations unlocked", options: { bullet: true, breakLine: true } },
    { text: "Sales motion is familiar to their procurement teams", options: { bullet: true } }
  ], { x: M + 6.4, y: 3.05, w: 4.9, h: 2.4, fontFace: F, fontSize: 13, color: MUTED, paraSpaceAfter: 7, margin: 0 });
  footer(s, 12);
}

// =====================================================================
// 13 — model 2
// =====================================================================
{
  const s = lightSlide("Revenue model 2", "One-time payment per occupation",
    "The entry point. Lets a buyer start without a committee, and creates a natural upgrade path.");
  card(s, M, 2.35, 5.6, 3.4);
  s.addText("How it works", { x: M + 0.35, y: 2.62, w: 5, h: 0.32, fontFace: F, fontSize: 16, bold: true, color: NAVY, margin: 0 });
  s.addText([
    { text: "The buyer unlocks a single occupation — drivers, cooks, electricians", options: { bullet: true, breakLine: true } },
    { text: "Full access to every candidate in that category, for a fixed window", options: { bullet: true, breakLine: true } },
    { text: "No subscription, no negotiation, no procurement cycle", options: { bullet: true, breakLine: true } },
    { text: "Unlocks credit toward an annual plan if they convert", options: { bullet: true } }
  ], { x: M + 0.35, y: 3.05, w: 5.0, h: 2.4, fontFace: F, fontSize: 13, color: MUTED, paraSpaceAfter: 7, margin: 0 });

  card(s, M + 6.05, 2.35, 5.55, 3.4, NAVY);
  s.addText("Why it earns its place", { x: M + 6.4, y: 2.62, w: 5, h: 0.32, fontFace: F, fontSize: 16, bold: true, color: WHITE, margin: 0 });
  s.addText([
    { text: "Removes the biggest objection: paying for a pool before seeing it", options: { bullet: true, breakLine: true, color: ICE } },
    { text: "Matches how staffing demand actually arrives — one urgent role at a time", options: { bullet: true, breakLine: true, color: ICE } },
    { text: "Reveals which occupations a buyer needs, which is the data that prices their renewal", options: { bullet: true, breakLine: true, color: ICE } },
    { text: "Works for small employers and families who will never buy a seat licence", options: { bullet: true, color: ICE } }
  ], { x: M + 6.4, y: 3.05, w: 4.9, h: 2.4, fontFace: F, fontSize: 13, paraSpaceAfter: 7, margin: 0 });
  footer(s, 13);
}

// =====================================================================
// 14 — additional streams A
// =====================================================================
{
  const s = lightSlide("Beyond access", "Additional revenue streams — commercial");
  const items = [
    ["Placement success fee", "A fee on confirmed hires. Aligns revenue with the outcome the client actually buys."],
    ["Verification tier", "Paid checks on references, documents and prior employers. Sold as a premium badge on the profile."],
    ["White-label and API", "Agencies and job boards embed the intake agent in their own funnel under their own brand."],
    ["Branded intake funnels", "A client's own WhatsApp link; they pay per profile created into their private pool."],
    ["Database enrichment", "Run an agency's existing unstructured candidate records through the agent to standardise them."],
    ["Sponsored roles", "Push an urgent vacancy to matching candidates on the channel they already use."]
  ];
  items.forEach((it, i) => {
    const x = M + (i % 3) * 4.05, y = 2.25 + Math.floor(i / 3) * 1.95;
    card(s, x, y, 3.75, 1.75);
    circle(s, x + 0.28, y + 0.28, 0.42, String(i + 1), BLUE);
    s.addText(it[0], { x: x + 0.28, y: y + 0.82, w: 3.2, h: 0.3, fontFace: F, fontSize: 14.5, bold: true, color: NAVY, margin: 0 });
    s.addText(it[1], { x: x + 0.28, y: y + 1.14, w: 3.25, h: 0.55, fontFace: F, fontSize: 11.5, color: MUTED, margin: 0 });
  });
  footer(s, 14);
}

// =====================================================================
// 15 — additional streams B
// =====================================================================
{
  const s = lightSlide("Beyond access", "Additional revenue streams — institutional",
    "Buyers who fund reach rather than access — often larger, slower, and stickier.");
  const items = [
    ["Programme licensing", "Government skilling and employability programmes pay per beneficiary reached, with reporting built in."],
    ["Labour-market analytics", "Aggregated, anonymised supply data: which trades exist where, and how that shifts over time."],
    ["Sponsored CV cohorts", "A corporate funds a number of CVs as measurable social impact, with named reporting."],
    ["Compliance packs", "Standardised worker records formatted for visa, labour-file and audit processes."]
  ];
  items.forEach((it, i) => {
    const x = M + (i % 2) * 6.05, y = 2.4 + Math.floor(i / 2) * 1.8;
    card(s, x, y, 5.75, 1.6, i % 2 === 0 ? SURFACE : WHITE);
    s.addText(it[0], { x: x + 0.35, y: y + 0.24, w: 5.1, h: 0.32, fontFace: F, fontSize: 15.5, bold: true, color: BLUE, margin: 0 });
    s.addText(it[1], { x: x + 0.35, y: y + 0.62, w: 5.1, h: 0.85, fontFace: F, fontSize: 12.5, color: MUTED, margin: 0 });
  });
  footer(s, 15);
  s.addNotes("Analytics and programme revenue only work if consent and aggregation are handled properly — see the guardrails slide.");
}

// =====================================================================
// 16 — pricing framework
// =====================================================================
{
  const s = lightSlide("Pricing", "How to price it, without guessing",
    "Deliberately no figures here — these should be set against your own placement economics.");
  const cols = [
    ["Value metric", ["Subscription: seats, or occupations unlocked", "Per-occupation: size and scarcity of the category", "Success fee: share of the placement's value"]],
    ["What it anchors against", ["Existing job-board and database spend", "Cost of a consultant's sourcing hours", "Referral fees already being paid"]],
    ["What moves it", ["Depth of the pool in that occupation", "Exclusivity and freshness of access", "Verification level and integration depth"]]
  ];
  cols.forEach((c, i) => {
    const x = M + i * 4.05;
    card(s, x, 2.45, 3.75, 3.0);
    s.addText(c[0], { x: x + 0.3, y: 2.72, w: 3.2, h: 0.34, fontFace: F, fontSize: 15.5, bold: true, color: NAVY, margin: 0 });
    s.addText(c[1].map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < c[1].length - 1 } })),
      { x: x + 0.3, y: 3.15, w: 3.2, h: 2.1, fontFace: F, fontSize: 12.5, color: MUTED, paraSpaceAfter: 9, margin: 0 });
  });
  s.addText("Rule of thumb: price against the cost of the hours this removes, not against the cost of running the software.",
    { x: M, y: 5.7, w: 11.5, h: 0.4, fontFace: F, fontSize: 14, italic: true, color: NAVY, margin: 0 });
  footer(s, 16);
}

// =====================================================================
// 17 — guardrails
// =====================================================================
{
  const s = lightSlide("Guardrails", "What we will not monetise",
    "Worth stating explicitly — procurement, ESG and legal will all ask.");
  const items = [
    ["No candidate charges, ever", "No fees, no premium placement, no pay-to-be-seen. The supply side stays free or the model breaks."],
    ["No selling personal data", "Analytics products are aggregated and anonymised. Individual records are never the product."],
    ["Consent before visibility", "A worker opts in explicitly before their profile is visible to employers, and can withdraw."],
    ["No exclusivity over a worker", "Candidates are never locked to one agency. They keep their CV and can take it anywhere."]
  ];
  items.forEach((it, i) => {
    const x = M, y = 2.35 + i * 0.98;
    card(s, x, y, 11.6, 0.86, i % 2 === 0 ? SURFACE : WHITE);
    circle(s, x + 0.28, y + 0.21, 0.44, "✓", GREEN, NAVY);
    s.addText(it[0], { x: x + 0.92, y: y + 0.1, w: 3.4, h: 0.65, fontFace: F, fontSize: 14, bold: true, color: NAVY, valign: "middle", margin: 0 });
    s.addText(it[1], { x: x + 4.4, y: y + 0.1, w: 7.0, h: 0.65, fontFace: F, fontSize: 12.5, color: MUTED, valign: "middle", margin: 0 });
  });
  footer(s, 17);
}

// =====================================================================
// 18 — land and expand
// =====================================================================
{
  const s = lightSlide("Go to market", "Land narrow, expand by occupation and geography");
  const phases = [
    ["Land", "One agency, one high-volume occupation, one city. Prove time-to-fill against their current process."],
    ["Expand", "More occupations, more seats, then integration into their ATS. Add the success fee once trust exists."],
    ["Extend", "New languages open new labour corridors. Programme and analytics revenue follows the scale of the pool."]
  ];
  phases.forEach((ph, i) => {
    const x = M + i * 4.05;
    card(s, x, 2.5, 3.75, 2.5, i === 0 ? NAVY : SURFACE);
    s.addText(["01", "02", "03"][i], { x: x + 0.3, y: 2.75, w: 1, h: 0.35, fontFace: F, fontSize: 13, bold: true, color: i === 0 ? GREEN : DIM, margin: 0 });
    s.addText(ph[0], { x: x + 0.3, y: 3.15, w: 3.1, h: 0.4, fontFace: F, fontSize: 20, bold: true, color: i === 0 ? WHITE : NAVY, margin: 0 });
    s.addText(ph[1], { x: x + 0.3, y: 3.65, w: 3.15, h: 1.2, fontFace: F, fontSize: 12.5, color: i === 0 ? ICE : MUTED, margin: 0 });
  });
  s.addText("The pool is the moat. Every conversation makes the next sale easier and the product harder to replicate.",
    { x: M, y: 5.35, w: 11.5, h: 0.45, fontFace: F, fontSize: 16, bold: true, color: BLUE, margin: 0 });
  footer(s, 18);
}

// =====================================================================
// 19 — honesty
// =====================================================================
{
  const s = lightSlide("Where we are", "What is built, and what is not",
    "Stated plainly, because the gaps are what a partnership would close first.");
  card(s, M, 2.4, 5.6, 3.2, SURFACE);
  s.addText("Working today", { x: M + 0.35, y: 2.68, w: 5, h: 0.32, fontFace: F, fontSize: 16, bold: true, color: GREEN, margin: 0 });
  s.addText([
    { text: "Voice note to bilingual CV, end to end", options: { bullet: true, breakLine: true } },
    { text: "Structured profiles with occupations grouped", options: { bullet: true, breakLine: true } },
    { text: "Employer portal and live impact dashboard", options: { bullet: true, breakLine: true } },
    { text: "Privacy enforced at the database level", options: { bullet: true } }
  ], { x: M + 0.35, y: 3.1, w: 5.0, h: 2.2, fontFace: F, fontSize: 13, color: MUTED, paraSpaceAfter: 7, margin: 0 });

  card(s, M + 6.05, 2.4, 5.55, 3.2);
  s.addText("Not yet done", { x: M + 6.4, y: 2.68, w: 5, h: 0.32, fontFace: F, fontSize: 16, bold: true, color: NAVY, margin: 0 });
  s.addText([
    { text: "Arabic voice replies — built, behind a paid-plan flag", options: { bullet: true, breakLine: true } },
    { text: "Job matching and interview practice", options: { bullet: true, breakLine: true } },
    { text: "Private CV storage with signed links", options: { bullet: true, breakLine: true } },
    { text: "Languages beyond Arabic; load testing at scale", options: { bullet: true } }
  ], { x: M + 6.4, y: 3.1, w: 4.9, h: 2.2, fontFace: F, fontSize: 13, color: MUTED, paraSpaceAfter: 7, margin: 0 });

  card(s, M, 5.8, 11.6, 0.95, NAVY);
  s.addText("Every part of this — the agent, the CV engine, the portals, the database and this deck — was designed and built end to end with Claude Cowork.",
    { x: M + 0.4, y: 5.98, w: 10.8, h: 0.6, fontFace: F, fontSize: 13.5, bold: true, color: WHITE, valign: "middle", margin: 0 });
  footer(s, 19);
  s.addNotes("Worth saying: the whole system was built with Claude Cowork, which is why the gap between the two columns is small and closes quickly.");
}

// =====================================================================
// 20 — close
// =====================================================================
{
  const s = darkSlide();
  s.addText("Voice in. Career out.", { x: M, y: 2.0, w: 11.5, h: 1.0, fontFace: F, fontSize: 46, bold: true, color: WHITE, margin: 0 });
  s.addText("Naatiq does not just match people to jobs. It makes more people matchable — and every profile it creates is an asset your competitors cannot search.",
    { x: M, y: 3.15, w: 8.8, h: 1.1, fontFace: F, fontSize: 16, color: ICE, margin: 0 });
  const asks = ["A pilot occupation and city", "Access to your placement economics", "A named commercial sponsor"];
  s.addText("What we are asking for", { x: M, y: 4.5, w: 6, h: 0.35, fontFace: F, fontSize: 13, bold: true, color: GREEN, charSpacing: 1, margin: 0 });
  asks.forEach((a, i) => {
    const x = M + i * 3.95;
    s.addShape(p.ShapeType.roundRect, { x, y: 4.95, w: 3.6, h: 0.8, fill: { color: "16234A" }, rectRadius: 0.14, line: { color: "2A3A63" } });
    s.addText(a, { x: x + 0.25, y: 4.95, w: 3.15, h: 0.8, fontFace: F, fontSize: 13, bold: true, color: WHITE, valign: "middle", margin: 0 });
  });
  s.addText("Karam Judeh   ·   Rahma Al Sharif   ·   Abderrahim Laghmari",
    { x: M, y: 6.5, w: 9, h: 0.3, fontFace: F, fontSize: 11.5, color: DIM, margin: 0 });
  footer(s, 20);
}

p.writeFile({ fileName: "/sessions/peaceful-zealous-albattani/mnt/outputs/naatiq-executive-deck.pptx" })
 .then(f => console.log("written:", f));
