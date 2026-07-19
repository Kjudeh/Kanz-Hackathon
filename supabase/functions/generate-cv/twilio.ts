// Outbound WhatsApp send (text + optional media URL) via the Twilio REST API.

import { getEnv } from "./env.ts";

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
    console.error("[twilio] not configured; would send to", to, "->", body, mediaUrl ?? "");
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
  form.set("Body", body);
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
    const error = e instanceof Error ? e.message : String(e);
    console.error("[twilio] network error", error);
    return { ok: false, error };
  }

  const text = await res.text();
  if (!res.ok) {
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
