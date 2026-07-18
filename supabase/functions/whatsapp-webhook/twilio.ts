// Twilio WhatsApp helpers: parse inbound, validate signature, download media,
// send outbound messages (text or media) via the REST API.

import { getEnv } from "./env.ts";
import type { Inbound } from "./types.ts";

export function parseTwilioForm(params: URLSearchParams): Inbound {
  const numMedia = parseInt(params.get("NumMedia") ?? "0", 10) || 0;
  return {
    from: (params.get("From") ?? "").trim(),
    to: (params.get("To") ?? "").trim(),
    body: params.get("Body") ?? "",
    numMedia,
    mediaUrl0: params.get("MediaUrl0") ?? "",
    mediaType0: params.get("MediaContentType0") ?? "",
    messageSid: params.get("MessageSid") ?? "",
  };
}

// Twilio request signature validation (HMAC-SHA1 over URL + sorted params).
// Note: behind a proxy the public URL must match exactly; keep disabled until
// you've confirmed the effective URL (see docs/SETUP.md).
export async function validateTwilioSignature(
  authToken: string, signature: string, url: string, params: URLSearchParams,
): Promise<boolean> {
  const sortedKeys = [...params.keys()].sort();
  let data = url;
  for (const k of sortedKeys) data += k + (params.get(k) ?? "");

  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(authToken),
    { name: "HMAC", hash: "SHA-1" }, false, ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sigBuf)));
  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function downloadTwilioMedia(
  url: string,
): Promise<{ bytes: Uint8Array; contentType: string }> {
  const env = getEnv();
  const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
  const res = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
  if (!res.ok) throw new Error(`media download failed ${res.status}`);
  const contentType = res.headers.get("content-type") ?? "audio/ogg";
  const bytes = new Uint8Array(await res.arrayBuffer());
  return { bytes, contentType };
}

export async function sendWhatsApp(to: string, body: string, mediaUrl?: string): Promise<void> {
  const env = getEnv();
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_WHATSAPP_FROM) {
    console.error("[twilio] not configured; would send to", to, "->", body);
    return;
  }
  const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
  const form = new URLSearchParams();
  form.set("To", to);
  form.set("From", env.TWILIO_WHATSAPP_FROM);
  form.set("Body", body);
  if (mediaUrl) form.set("MediaUrl", mediaUrl);

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    },
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Twilio send failed ${res.status}: ${t}`);
  }
}
