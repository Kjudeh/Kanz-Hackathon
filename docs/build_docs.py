#!/usr/bin/env python3
"""
Render every Markdown file in docs/src/ to a branded Naatiq PDF in docs/pdf/.

The Markdown files are the source of truth — edit those and re-run this script
rather than editing PDFs. Usage:

    pip install markdown weasyprint --break-system-packages
    python3 docs/build_docs.py
"""
import base64
import io
import re
from pathlib import Path

import markdown
from PIL import Image
from weasyprint import HTML

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
OUT = ROOT / "pdf"
LOGO = ROOT.parent / "dashboard" / "assets" / "naatiq-logo.png"

BRAND = {"navy": "#001737", "blue": "#0E52E5", "emerald": "#09A385"}

# Credited on the cover of every generated document.
TEAM = ["Karam Judeh", "Rahma Al Sharif", "Abderrahim Laghmari"]


def logo_data_uri() -> str:
    im = Image.open(LOGO).convert("RGBA")
    buf = io.BytesIO()
    im.save(buf, format="PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


CSS = """
@page {
  size: A4;
  margin: 22mm 18mm 20mm 18mm;
  @bottom-left { content: "%(doc)s"; font-size: 8.5pt; color: #9aa5b1; }
  @bottom-right { content: "Naatiq — page " counter(page); font-size: 8.5pt; color: #9aa5b1; }
}
* { box-sizing: border-box; }
body { font-family: 'Lato','Cairo','Amiri','Segoe UI',Helvetica,Arial,sans-serif; color: #1f2933;
       font-size: 10.5pt; line-height: 1.62; }

.cover { border-bottom: 3px solid %(emerald)s; padding-bottom: 16px; margin-bottom: 26px; }
.cover img { height: 74px; }
.cover .kicker { color: %(blue)s; font-size: 8.5pt; font-weight: 700;
                 letter-spacing: 1.4px; text-transform: uppercase; margin-top: 12px; }
.cover h1 { font-size: 25pt; color: %(navy)s; margin: 4px 0 6px; line-height: 1.2; }
.cover .sub { color: #5b6b82; font-size: 11pt; margin: 0; }
.cover .team { margin: 10px 0 0; font-size: 9pt; color: #7b8794; }
.cover .team b { color: %(navy)s; font-weight: 700; letter-spacing: .3px; }

h2 { font-size: 14pt; color: %(navy)s; margin: 22px 0 8px;
     border-bottom: 2px solid %(blue)s; padding-bottom: 5px; }
h3 { font-size: 11.5pt; color: %(blue)s; margin: 16px 0 5px; }
h4 { font-size: 10.5pt; color: %(navy)s; margin: 13px 0 4px; }
p { margin: 0 0 10px; }
ul, ol { margin: 0 0 11px; padding-inline-start: 20px; }
li { margin-bottom: 5px; }
strong { color: %(navy)s; }
a { color: %(blue)s; text-decoration: none; }

blockquote { border-inline-start: 3px solid %(emerald)s; background: #f4f7fb;
             margin: 12px 0; padding: 10px 16px; color: #3e4c59; }
blockquote p:last-child { margin-bottom: 0; }

code { font-family: 'DejaVu Sans Mono',monospace; font-size: 8.8pt;
       background: #eef2f7; padding: 1px 5px; border-radius: 4px; color: %(navy)s; }
pre { background: #f6f8fb; border: 1px solid #e4eaf1; border-inline-start: 3px solid %(blue)s;
      border-radius: 6px; padding: 11px 13px; overflow-wrap: break-word;
      white-space: pre-wrap; font-size: 8.6pt; margin: 0 0 12px; }
pre code { background: none; padding: 0; font-size: 8.6pt; }

table { border-collapse: collapse; width: 100%%; margin: 0 0 14px; font-size: 9.4pt; }
th { background: %(navy)s; color: #fff; text-align: start; padding: 7px 10px; font-weight: 700; }
td { border-bottom: 1px solid #e4eaf1; padding: 7px 10px; vertical-align: top; }
tr:nth-child(even) td { background: #f9fbfd; }

hr { border: none; border-top: 1px solid #e4eaf1; margin: 20px 0; }
.ar { direction: rtl; text-align: right; font-family: 'Cairo','Amiri',sans-serif; }
""" % {**BRAND, "doc": "%(doc)s"}


TEMPLATE = """<!DOCTYPE html><html><head><meta charset="utf-8"><style>{css}</style></head>
<body>
  <div class="cover">
    <img src="{logo}" alt="Naatiq"/>
    <div class="kicker">{kicker}</div>
    <h1>{title}</h1>
    <p class="sub">{subtitle}</p>
    <p class="team"><b>Team</b> &nbsp;·&nbsp; {team}</p>
  </div>
  {body}
</body></html>"""


def parse(md_text: str):
    """First '# Heading' is the title; an immediately following '> line' is the subtitle."""
    title, subtitle, rest = "Document", "", md_text
    m = re.match(r"^#\s+(.+?)\n", md_text)
    if m:
        title = m.group(1).strip()
        rest = md_text[m.end():]
        m2 = re.match(r"^\s*>\s+(.+?)\n", rest)
        if m2:
            subtitle = m2.group(1).strip()
            rest = rest[m2.end():]
    return title, subtitle, rest


def build():
    OUT.mkdir(exist_ok=True)
    logo = logo_data_uri()
    files = sorted(SRC.glob("*.md"))
    if not files:
        print("no sources in", SRC)
        return
    for f in files:
        title, subtitle, body_md = parse(f.read_text(encoding="utf-8"))
        body = markdown.markdown(
            body_md, extensions=["tables", "fenced_code", "sane_lists", "attr_list"]
        )
        html = TEMPLATE.format(
            css=CSS.replace("%(doc)s", title.replace('"', "'")),
            logo=logo,
            kicker="ناطق · Naatiq — documentation",
            title=title,
            subtitle=subtitle,
            team=" &nbsp;·&nbsp; ".join(TEAM),
            body=body,
        )
        pdf = OUT / (f.stem + ".pdf")
        HTML(string=html, base_url=str(ROOT)).write_pdf(str(pdf))
        print(f"{f.name}  →  {pdf.relative_to(ROOT.parent)}")


if __name__ == "__main__":
    build()
