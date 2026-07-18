// Orchestration: inbound message -> (transcribe if voice) -> interview -> reply,
// persisting user, profile, and conversation state along the way.

import {
  getAdminClient, getOrCreateProfile, getRecentHistory,
  logConversation, mergeProfile, setUserState, updateProfile, upsertUser,
} from "./db.ts";
import { downloadTwilioMedia, sendWhatsApp } from "./twilio.ts";
import { transcribeAudio } from "./groq.ts";
import { runInterviewer } from "./interviewer.ts";
import type { Inbound } from "./types.ts";

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

  if (result.profile_complete && user.state === "interviewing") {
    await setUserState(supa, user.id, "profile_complete");
    console.log(`[state] user ${user.id} -> profile_complete (CV generation lands in Phase 3)`);
    // Phase 3: invoke the generate-cv Edge Function here.
  }

  if (!opts.returnReply) await sendWhatsApp(inbound.from, result.reply_ar);
  return result.reply_ar;
}
