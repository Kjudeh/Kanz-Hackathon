#!/usr/bin/env python3
"""
Local preview renderer for the Wathefti CV template.

Fills cv/template.html with a realistic bilingual sample profile, swaps the
Google-Fonts @import for locally-installed fonts (so it renders offline), and
writes a PDF via WeasyPrint. This is a DESIGN/PREVIEW tool — production CV
generation happens in the generate-cv Edge Function using the same template.

Usage:  python3 cv/preview/render_preview.py [output.pdf]
"""
import html
import re
import sys
from pathlib import Path

from weasyprint import HTML

ROOT = Path(__file__).resolve().parents[1]          # .../cv
TEMPLATE = ROOT / "template.html"
FONT_DIR = Path("/tmp/cvbuild/node_modules/@fontsource")

LOCAL_FONTS = f"""
  @font-face {{ font-family:'Lato'; font-weight:400;
    src:url('file://{FONT_DIR}/lato/files/lato-latin-400-normal.woff'); }}
  @font-face {{ font-family:'Lato'; font-weight:700;
    src:url('file://{FONT_DIR}/lato/files/lato-latin-700-normal.woff'); }}
  @font-face {{ font-family:'Cairo'; font-weight:400;
    src:url('file://{FONT_DIR}/cairo/files/cairo-arabic-400-normal.woff'); }}
  @font-face {{ font-family:'Cairo'; font-weight:600;
    src:url('file://{FONT_DIR}/cairo/files/cairo-arabic-600-normal.woff'); }}
  @font-face {{ font-family:'Cairo'; font-weight:700;
    src:url('file://{FONT_DIR}/cairo/files/cairo-arabic-700-normal.woff'); }}
  @font-face {{ font-family:'Amiri'; font-weight:400;
    src:url('file://{FONT_DIR}/amiri/files/amiri-arabic-400-normal.woff'); }}
  @font-face {{ font-family:'Amiri'; font-weight:700;
    src:url('file://{FONT_DIR}/amiri/files/amiri-arabic-700-normal.woff'); }}
"""

# --- Sample bilingual profile (the kind of content generate-cv will produce) ---
SAMPLE = {
    "name_en": "Fatima Hassan",
    "name_ar": "فاطمة حسن",
    "role_en": "Housekeeper & Nanny",
    "role_ar": "مدبرة منزل ومربية أطفال",
    "phone": "+971 50 123 4567  ·  WhatsApp",
    "summary_en": "Reliable and caring housekeeper with over 8 years of experience "
                  "running family homes across the Gulf. Trusted with childcare, "
                  "cooking, and full household management.",
    "summary_ar": "مدبرة منزل موثوقة وذات خبرة تزيد عن ٨ سنوات في إدارة منازل العائلات "
                  "في دول الخليج. موثوقة في رعاية الأطفال والطبخ وإدارة المنزل بالكامل.",
    "experience_en": [
        ("Al-Rashid Family — Dubai", "Housekeeper & Nanny · 5 years"),
        ("Al-Fahim Household — Abu Dhabi", "Housekeeper · 3 years"),
    ],
    "experience_ar": [
        ("عائلة الراشد — دبي", "مدبرة منزل ومربية · ٥ سنوات"),
        ("عائلة الفهيم — أبوظبي", "مدبرة منزل · ٣ سنوات"),
    ],
    "skills_en": ["Childcare", "Deep cleaning", "Cooking", "Laundry & ironing",
                  "Time management", "Trustworthy"],
    "skills_ar": ["رعاية الأطفال", "التنظيف العميق", "الطبخ", "الغسيل والكي",
                  "تنظيم الوقت", "الأمانة"],
    "tools_en": ["Vacuum cleaner", "Steam cleaner", "Washing machine",
                 "Standard cleaning products"],
    "tools_ar": ["مكنسة كهربائية", "منظف بخاري", "غسالة", "مواد التنظيف"],
    "achievement_en": "Trusted to manage a household of six and care for two young "
                      "children single-handedly for five years.",
    "achievement_ar": "موثوقة بإدارة منزل لعائلة من ستة أفراد ورعاية طفلين صغيرين "
                      "بمفردي لمدة خمس سنوات.",
}

LABELS = {
    "en": {"profile": "Profile", "experience": "Experience", "skills": "Skills",
           "tools": "Tools", "achievement": "Achievement"},
    "ar": {"profile": "نبذة", "experience": "الخبرة العملية", "skills": "المهارات",
           "tools": "الأدوات", "achievement": "إنجاز أفتخر به"},
}


def esc(s: str) -> str:
    return html.escape(s, quote=False)


def build_column(lang: str, data: dict) -> str:
    L = LABELS[lang]
    summary = data[f"summary_{lang}"]
    experience = data[f"experience_{lang}"]
    skills = data[f"skills_{lang}"]
    tools = data[f"tools_{lang}"]
    achievement = data[f"achievement_{lang}"]

    entries = "".join(
        f'<div class="entry"><div class="org">{esc(org)}</div>'
        f'<div class="dur">{esc(dur)}</div></div>'
        for org, dur in experience
    )
    skill_chips = "".join(f'<span class="chip">{esc(s)}</span>' for s in skills)
    tool_chips = "".join(f'<span class="chip">{esc(t)}</span>' for t in tools)

    return (
        f'<section><h2>{esc(L["profile"])}</h2>'
        f'<p class="summary">{esc(summary)}</p></section>'
        f'<section><h2>{esc(L["experience"])}</h2>{entries}</section>'
        f'<section><h2>{esc(L["skills"])}</h2><div class="chips">{skill_chips}</div></section>'
        f'<section><h2>{esc(L["tools"])}</h2><div class="chips">{tool_chips}</div></section>'
        f'<section><h2>{esc(L["achievement"])}</h2>'
        f'<p class="summary">{esc(achievement)}</p></section>'
    )


def render(out_path: Path) -> None:
    tpl = TEMPLATE.read_text(encoding="utf-8")
    # Swap remote @import for local @font-face so preview renders offline.
    tpl = re.sub(r"@import url\([^)]*\);", LOCAL_FONTS, tpl, count=1)

    filled = (
        tpl.replace("{{NAME_EN}}", esc(SAMPLE["name_en"]))
        .replace("{{NAME_AR}}", esc(SAMPLE["name_ar"]))
        .replace("{{ROLE_EN}}", esc(SAMPLE["role_en"]))
        .replace("{{ROLE_AR}}", esc(SAMPLE["role_ar"]))
        .replace("{{PHONE}}", esc(SAMPLE["phone"]))
        .replace("{{COL_EN}}", build_column("en", SAMPLE))
        .replace("{{COL_AR}}", build_column("ar", SAMPLE))
        .replace("{{FOOTER}}", 'Generated by <span class="brand">Wathefti · وظيفتي</span>')
    )

    HTML(string=filled, base_url=str(ROOT)).write_pdf(str(out_path))
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else (ROOT / "wathefti-cv-sample.pdf")
    render(out)
