// The bilingual CV HTML template + fill logic. Mirrors cv/template.html so the
// local preview and production output share one design.

import type { CvContent } from "./cvwriter.ts";

const TEMPLATE = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700&family=Lato:wght@400;700&display=swap');

  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: 'Lato', sans-serif;
    color: #1f2933;
    font-size: 13px;
    line-height: 1.5;
  }

  .en { direction: ltr; text-align: left; }
  .ar { direction: rtl; text-align: right; font-family: 'Cairo', sans-serif; }

  .header { background: #0f4c5c; color: #fff; padding: 26px 40px 22px; }
  .names { display: flex; justify-content: space-between; align-items: baseline; gap: 20px; }
  .name-en { font-size: 30px; font-weight: 700; letter-spacing: .2px; }
  .name-ar { font-size: 30px; font-weight: 700; font-family: 'Cairo', sans-serif; }
  .roles { display: flex; justify-content: space-between; gap: 20px; margin-top: 4px;
           color: #cfe3e7; font-size: 14.5px; }
  .role-ar { font-family: 'Cairo', sans-serif; }
  .contact { margin-top: 14px; font-size: 12.5px; color: #e8f1f2;
             border-top: 1px solid rgba(255,255,255,.18); padding-top: 10px; }

  .body { display: flex; }
  .col { flex: 1; padding: 22px 40px 8px; }
  .col-en { border-right: 1px solid #e5e7eb; }

  h2 { font-size: 12.5px; font-weight: 700; text-transform: uppercase;
       letter-spacing: .06em; color: #0f4c5c;
       border-bottom: 2px solid #0f4c5c; padding-bottom: 4px; margin: 16px 0 9px; }
  .ar h2 { text-transform: none; letter-spacing: 0; font-size: 15px; }
  section:first-child h2 { margin-top: 0; }

  p.summary { margin: 0; color: #3e4c59; }

  .entry { margin-bottom: 9px; }
  .entry .org { font-weight: 700; color: #1f2933; }
  .entry .dur { color: #616e7c; font-size: 12px; }

  .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
  .ar .chips { justify-content: flex-start; }
  .chip { background: #e8f1f2; color: #0f4c5c; border-radius: 12px;
          padding: 3px 11px; font-size: 12px; white-space: nowrap; }

  .footer { text-align: center; color: #9aa5b1; font-size: 10.5px;
            padding: 12px; border-top: 1px solid #e5e7eb; margin-top: 8px; }
  .footer .brand { color: #0f4c5c; font-weight: 700; }
</style>
</head>
<body>
  <div class="header">
    <div class="names">
      <div class="name-en en">{{NAME_EN}}</div>
      <div class="name-ar ar">{{NAME_AR}}</div>
    </div>
    <div class="roles">
      <div class="role-en en">{{ROLE_EN}}</div>
      <div class="role-ar ar">{{ROLE_AR}}</div>
    </div>
    <div class="contact">{{PHONE}}</div>
  </div>

  <div class="body">
    <div class="col col-en en">{{COL_EN}}</div>
    <div class="col col-ar ar">{{COL_AR}}</div>
  </div>

  <div class="footer">{{FOOTER}}</div>
</body>
</html>`;

const LABELS = {
  en: { profile: "Profile", experience: "Experience", skills: "Skills", tools: "Tools", achievement: "Achievement" },
  ar: { profile: "نبذة", experience: "الخبرة العملية", skills: "المهارات", tools: "الأدوات", achievement: "إنجاز أفتخر به" },
};

function esc(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildColumn(lang: "en" | "ar", c: CvContent): string {
  const L = LABELS[lang];
  const summary = lang === "en" ? c.summary_en : c.summary_ar;
  const exp = lang === "en" ? c.experience_en : c.experience_ar;
  const skills = lang === "en" ? c.skills_en : c.skills_ar;
  const tools = lang === "en" ? c.tools_en : c.tools_ar;
  const ach = lang === "en" ? c.achievement_en : c.achievement_ar;

  const entries = (exp ?? [])
    .map((e) => `<div class="entry"><div class="org">${esc(e.org)}</div><div class="dur">${esc(e.dur)}</div></div>`)
    .join("");
  const skillChips = (skills ?? []).map((s) => `<span class="chip">${esc(s)}</span>`).join("");
  const toolChips = (tools ?? []).map((t) => `<span class="chip">${esc(t)}</span>`).join("");

  let html = `<section><h2>${esc(L.profile)}</h2><p class="summary">${esc(summary)}</p></section>`;
  html += `<section><h2>${esc(L.experience)}</h2>${entries}</section>`;
  if (skillChips) html += `<section><h2>${esc(L.skills)}</h2><div class="chips">${skillChips}</div></section>`;
  if (toolChips) html += `<section><h2>${esc(L.tools)}</h2><div class="chips">${toolChips}</div></section>`;
  if (ach) html += `<section><h2>${esc(L.achievement)}</h2><p class="summary">${esc(ach)}</p></section>`;
  return html;
}

export function fillTemplate(c: CvContent): string {
  return TEMPLATE
    .replace("{{NAME_EN}}", esc(c.name_en))
    .replace("{{NAME_AR}}", esc(c.name_ar))
    .replace("{{ROLE_EN}}", esc(c.role_en))
    .replace("{{ROLE_AR}}", esc(c.role_ar))
    .replace("{{PHONE}}", esc(c.phone))
    .replace("{{COL_EN}}", buildColumn("en", c))
    .replace("{{COL_AR}}", buildColumn("ar", c))
    .replace("{{FOOTER}}", 'Generated by <span class="brand">Wathefti · وظيفتي</span>');
}
