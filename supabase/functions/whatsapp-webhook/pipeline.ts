// Orchestration: inbound message -> (transcribe if voice) -> interview -> reply,
// persisting user, profile, and conversation state along the way.

import {
  getAdminClient, getOrCreateProfile, getRecentHistory,
  logConversation, mergeProfile, setUserState, updateProfile, upsertUser,
} from "./db.ts";
import { downloadTwilioMedia, sendWhatsApp } from "./twilio.ts";
import { transcribeAudio } from "./groq.ts";
import { runInterviewer } from "./interviewer.ts";
import { synthesizeArabic, voiceRepliesEnabled } from "./tts.ts";
import { getEnv } from "./env.ts";
import type { Inbound } from "./types.ts";
import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

export async function processInbound(
  inbound: Inbound,
  opts: { returnReply?: boolean } = {},
): Promise<string> {
  const supa = getAdminClient();
  const user = await upsertUser(supa, inbound.from);

  let text = (inbound.body ?? "").trim();
  let medium: "text" | "voice" = "text";

  // Voice note -> store raw audio -> transcribe.
  if (inbound.numMedia > 0 && inbound.mediaType0.startsWith("audio")) {
    medium = "voice";
    try {
      const audio = await downloadTwilioMedia(inbound.mediaUrl0);
      const path = `${user.id}/${crypto.randomUUID()}.ogg`;
      await supa.storage.from("voice-notes").upload(path, audio.bytes, {
        contentType: audio.contentType,
        upsert: true,
      });
      text = await transcribeAudio(audio.bytes, audio.contentType);
    } catch (e) {
      console.error("[voice]", e);
    }
  }

  if (!text) {
    const msg = "ما وصلتني رسالتك بشكل واضح 🙏 ممكن ترسل لي رسالة صوتية تحكي فيها عن شغلك؟";
    if (!opts.returnReply) await sendWhatsApp(inbound.from, msg);
    return msg;
  }

  await logConversation(supa, user.id, "inbound", medium, text);

  const profile = await getOrCreateProfile(supa, user.id);
  const history = await getRecentHistory(supa, user.id, 12);

  const result = await runInterviewer({ profile, history, latestMessage: text });

  const merged = mergeProfile(profile, result.profile_updates);
  await updateProfile(supa, profile.id, merged);

  await logConversation(supa, user.id, "outbound", "text", result.reply_ar);

  // Deliver BEFORE triggering CV generation, so a CV failure can never block the reply.
  if (!opts.returnReply) await deliverReply(supa, inbound.from, user.id, result.reply_ar);

  if (result.profile_complete && user.state === "interviewing") {
    await setUserState(supa, user.id, "profile_complete");
    if (!opts.returnReply) await invokeGenerateCv(user.id);
  }

  return result.reply_ar;
}

// Send the reply as text, and — if voice replies are enabled — also as an Arabic
// voice note (TTS -> Storage -> signed URL -> WhatsApp media), for a voice-native
// experience. Voice failures never block the text reply.
async function deliverReply(
  supa: SupabaseClient, to: string, userId: string, text: string,
): Promise<void> {
  // Text first, and never let a send error abort the rest of the pipeline.
  try {
    await sendWhatsApp(to, text);
  } catch (e) {
    console.error("[send text]", e);
  }

  if (!voiceRepliesEnabled()) return;
  try {
    const audio = await synthesizeArabic(text);
    if (!audio) return;
    const path = `replies/${userId}/${crypto.randomUUID()}.mp3`;
    const up = await supa.storage.from("voice-replies").upload(path, audio.bytes, {
      contentType: audio.contentType,
      upsert: true,
    });
    if (up.error) { console.error("[voice-reply upload]", up.error); return; }
    const signed = await supa.storage.from("voice-replies").createSignedUrl(path, 3600);
    if (signed.data?.signedUrl) await sendWhatsApp(to, "", signed.data.signedUrl);
  } catch (e) {
    console.error("[voice-reply]", e);
  }
}

// Fire the CV generation function (server-to-server, service-role auth). It acks
// fast (202) and renders the PDF in its own background task.
async function invokeGenerateCv(userId: string): Promise<void> {
  const env = getEnv();
  try {
    const res = await fetch(`${env.SUPABASE_URL}/functions/v1/generate-cv`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) console.error("[invokeGenerateCv]", res.status, await res.text());
  } catch (e) {
    console.error("[invokeGenerateCv]", e);
  }
}
