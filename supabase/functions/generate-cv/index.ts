// generate-cv — builds and delivers a bilingual PDF CV for a completed profile.
//
// Deployed with verify_jwt = true: it is invoked server-to-server by the webhook
// using the service-role key, so only trusted callers can trigger it.
//
// Acks fast (202), then does the slow work (CV writing -> render -> upload ->
// send) in the background so the caller isn't blocked.

import { getAdminClient, getLatestProfile, getUserById, setCvPath, setUserState } from "./db.ts";
import { getEnv } from "./env.ts";
import { writeCv } from "./cvwriter.ts";
import { fillTemplate } from "./cv_template.ts";
import { renderPdf } from "./render.ts";
import { sendWhatsApp } from "./twilio.ts";

declare const EdgeRuntime:
  | { waitUntil(p: Promise<unknown>): void }
  | undefined;

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // ignore
  }
  const userId = String(body.user_id ?? "");
  if (!userId) {
    return new Response(JSON.stringify({ error: "user_id required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const work = generateAndSend(userId).catch((e) => console.error("[generate-cv]", e));
  if (typeof EdgeRuntime !== "undefined" && EdgeRuntime?.waitUntil) {
    EdgeRuntime.waitUntil(work);
  } else {
    await work;
  }

  return new Response(JSON.stringify({ accepted: true, user_id: userId }), {
    status: 202,
    headers: { "content-type": "application/json" },
  });
});

async function generateAndSend(userId: string): Promise<void> {
  const env = getEnv();
  const supa = getAdminClient();

  const user = await getUserById(supa, userId);
  const profile = await getLatestProfile(supa, userId);
  const phone = String(user.whatsapp_number ?? "").replace("whatsapp:", "").trim();

  const content = await writeCv(profile, phone);
  const html = fillTemplate(content);
  const pdf = await renderPdf(html);

  const path = `${userId}/cv.pdf`;
  const up = await supa.storage.from("cvs").upload(path, pdf, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (up.error) throw up.error;

  await setCvPath(supa, profile.id, path);

  const ttl = parseInt(env.CV_SIGNED_URL_TTL, 10) || 604800;
  const signed = await supa.storage.from("cvs").createSignedUrl(path, ttl);
  const cvUrl = signed.data?.signedUrl ?? undefined;

  const caption = "سيرتك الذاتية جاهزة! ✅ مبروك عليك — هذي سيرتك بالعربي والإنجليزي، جاهزة ترسلها لأي شغل. بالتوفيق 🌟";
  const sent = await sendWhatsApp(user.whatsapp_number, caption, cvUrl);

  // The CV is rendered and stored either way, but the user has only actually
  // received it if Twilio accepted the message. Do NOT advance to cv_sent on a
  // failed delivery — that would report success for a CV nobody ever got.
  if (!sent.ok) {
    throw new Error(`CV rendered and stored at ${path} but delivery failed — ${sent.error}`);
  }

  await setUserState(supa, userId, "cv_sent");
  console.log(`[generate-cv] delivered CV for user ${userId} at ${path} (sid ${sent.sid})`);
}
