// HTML -> PDF rendering. Prefers Gotenberg (Chromium — best Arabic RTL + correct
// text layer); falls back to a hosted API (PDFShift) if that's what's configured.

import { getEnv } from "./env.ts";

export async function renderPdf(html: string): Promise<Uint8Array> {
  const env = getEnv();
  if (env.GOTENBERG_URL) return renderGotenberg(env.GOTENBERG_URL, html);
  if (env.PDFSHIFT_API_KEY) return renderPdfShift(env.PDFSHIFT_API_KEY, html);
  throw new Error("No PDF renderer configured — set GOTENBERG_URL or PDFSHIFT_API_KEY");
}

async function renderGotenberg(base: string, html: string): Promise<Uint8Array> {
  const form = new FormData();
  form.append("files", new Blob([html], { type: "text/html" }), "index.html");
  form.append("preferCssPageSize", "true");
  form.append("printBackground", "true");
  form.append("marginTop", "0");
  form.append("marginBottom", "0");
  form.append("marginLeft", "0");
  form.append("marginRight", "0");
  // Give Chromium a moment for the web fonts to load before printing.
  form.append("waitDelay", "2s");

  // Accept a bare host (Railway/Fly display it without a scheme) as well as a full URL.
  const root = /^https?:\/\//i.test(base.trim()) ? base.trim() : `https://${base.trim()}`;
  const url = root.replace(/\/+$/, "") + "/forms/chromium/convert/html";

  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) {
    throw new Error(`Gotenberg ${res.status} at ${url}: ${(await res.text()).slice(0, 300)}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

async function renderPdfShift(key: string, html: string): Promise<Uint8Array> {
  const res = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: "Basic " + btoa("api:" + key),
    },
    body: JSON.stringify({ source: html, format: "A4", margin: "0", use_print: true }),
  });
  if (!res.ok) throw new Error(`PDFShift ${res.status}: ${await res.text()}`);
  return new Uint8Array(await res.arrayBuffer());
}
