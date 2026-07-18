// Naatiq — WhatsApp inbound webhook (Twilio) + interview orchestration.
//
// Deployed with verify_jwt = false: Twilio cannot send a Supabase JWT, so this
// function does its own auth (optional Twilio signature validation) instead.
//
// Flow: acknowledge Twilio immediately with empty TwiML, then run the slow work
// (download voice note -> transcribe -> interview -> reply) in the background via
// EdgeRuntime.waitUntil, so we never brush Twilio's ~15s webhook timeout.

import { getEnv } from "./env.ts";
import { parseTwilioForm, validateTwilioSignature } from "./twilio.ts";
import { processInbound } from "./pipeline.ts";
import { callClaude } from "./anthropic.ts";

declare const EdgeRuntime:
  | { waitUntil(p: Promise<unknown>): void }
  | undefined;

const XML_OK =
  '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const env = getEnv();

  // Health check — lets us confirm the deployment is reachable without secrets.
  if (req.method === "GET") {
    // Diagnostic self-test: GET ?selftest=<WATHEFTI_TEST_SECRET>
    // Reports which integrations are configured and pings Claude, so failures are
    // visible without digging through console logs.
    const selftest = url.searchParams.get("selftest");
    if (selftest && env.WATHEFTI_TEST_SECRET && selftest === env.WATHEFTI_TEST_SECRET) {
      const result: Record<string, unknown> = {
        model: env.ANTHROPIC_MODEL,
        anthropic_key_set: !!env.ANTHROPIC_API_KEY,
        groq_key_set: !!env.GROQ_API_KEY,
        twilio_configured: !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_WHATSAPP_FROM),
        voice_replies: env.WATHEFTI_VOICE_REPLIES === "true",
      };
      try {
        const t = await callClaude({
          system: "Reply with the single word OK.",
          messages: [{ role: "user", content: "ping" }],
          maxTokens: 16,
        });
        result.anthropic = "OK: " + t.slice(0, 60);
      } catch (e) {
        result.anthropic = "ERROR: " + (e instanceof Error ? e.message : String(e));
      }
      return new Response(JSON.stringify(result, null, 2), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response("Naatiq webhook is running.", { status: 200 });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const contentType = req.headers.get("content-type") ?? "";

  // --- Dev/test mode: simulate an inbound message without Twilio ---
  // Enabled only when WATHEFTI_TEST_SECRET is set AND the caller presents it.
  // Returns the agent's reply synchronously so you can test the interviewer
  // (once ANTHROPIC_API_KEY is set) with a simple JSON POST.
  if (contentType.includes("application/json")) {
    if (
      env.WATHEFTI_TEST_SECRET &&
      req.headers.get("x-wathefti-test-secret") === env.WATHEFTI_TEST_SECRET
    ) {
      const body = await req.json().catch(() => ({} as Record<string, unknown>));
      const reply = await processInbound(
        {
          from: String(body.from ?? "whatsapp:+10000000000"),
          to: env.TWILIO_WHATSAPP_FROM,
          body: String(body.text ?? ""),
          numMedia: 0,
          mediaUrl0: "",
          mediaType0: "",
          messageSid: "test",
        },
        { returnReply: true },
      );
      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response("Forbidden", { status: 403 });
  }

  // --- Twilio webhook (application/x-www-form-urlencoded) ---
  const rawBody = await req.text();
  const params = new URLSearchParams(rawBody);

  if (env.VALIDATE_TWILIO_SIGNATURE === "true" && env.TWILIO_AUTH_TOKEN) {
    const signature = req.headers.get("x-twilio-signature") ?? "";
    const ok = await validateTwilioSignature(
      env.TWILIO_AUTH_TOKEN,
      signature,
      url.toString(),
      params,
    );
    if (!ok) return new Response("Invalid Twilio signature", { status: 403 });
  }

  const inbound = parseTwilioForm(params);
  if (!inbound.from) {
    return new Response(XML_OK, {
      status: 200,
      headers: { "content-type": "text/xml" },
    });
  }

  // Ack Twilio now; do the slow work in the background.
  const work = processInbound(inbound).catch((e) =>
    console.error("[processInbound]", e)
  );
  if (typeof EdgeRuntime !== "undefined" && EdgeRuntime?.waitUntil) {
    EdgeRuntime.waitUntil(work);
  } else {
    await work;
  }

  return new Response(XML_OK, {
    status: 200,
    headers: { "content-type": "text/xml" },
  });
});
