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

// The outcome of a send attempt. sendWhatsApp never throws: callers decide what
// a failure means, and — critically — a failure is always reportable rather than
// swallowed. A Twilio rejection (rate limit, bad channel, expired session) is a
// normal operating condition, not an exception.
export interface SendResult {
  ok: boolean;
  sid?: string;
  status?: number;
  code?: number;
  error?: string;
}

export async function sendWhatsApp(
  to: string,
  body: string,
  mediaUrl?: string,
): Promise<SendResult> {
  const env = getEnv();
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_WHATSAPP_FROM) {
    console.error("[twilio] not configured; would send to", to, "->", body);
    return { ok: false, error: "Twilio not configured" };
  }
  // Twilio requires the whatsapp: prefix on both ends; add it defensively.
  const from = env.TWILIO_WHATSAPP_FROM.startsWith("whatsapp:")
    ? env.TWILIO_WHATSAPP_FROM
    : `whatsapp:${env.TWILIO_WHATSAPP_FROM}`;
  const dest = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
  const form = new URLSearchParams();
  form.set("To", dest);
  form.set("From", from);
  if (body) form.set("Body", body);
  if (mediaUrl) form.set("MediaUrl", mediaUrl);

  let res: Response;
  try {
    res = await fetch(
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
  } catch (e) {
    // Network-level failure: never reached Twilio at all.
    const error = e instanceof Error ? e.message : String(e);
    console.error("[twilio] network error", error);
    return { ok: false, error };
  }

  const text = await res.text();
  if (!res.ok) {
    // Twilio returns a JSON body with a numeric `code` that identifies the
    // reason precisely (63038 = daily cap, 63007 = bad channel, and so on).
    let code: number | undefined;
    let message = text;
    try {
      const j = JSON.parse(text);
      code = typeof j.code === "number" ? j.code : undefined;
      message = j.message ?? text;
    } catch { /* keep the raw body */ }
    const error = `Twilio ${res.status}${code ? ` (${code})` : ""}: ${message}`;
    console.error("[twilio]", error);
    return { ok: false, status: res.status, code, error };
  }

  let sid: string | undefined;
  try {
    sid = JSON.parse(text).sid;
  } catch { /* delivered, SID just unparsed */ }
  return { ok: true, sid, status: res.status };
}
