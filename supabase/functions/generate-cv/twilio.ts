// Outbound WhatsApp send (text + optional media URL) via the Twilio REST API.

import { getEnv } from "./env.ts";

export async function sendWhatsApp(to: string, body: string, mediaUrl?: string): Promise<void> {
  const env = getEnv();
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_WHATSAPP_FROM) {
    console.error("[twilio] not configured; would send to", to, "->", body, mediaUrl ?? "");
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
