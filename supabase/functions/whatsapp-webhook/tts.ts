// Arabic text-to-speech for voice replies (ElevenLabs multilingual).
// Optional: only runs when WATHEFTI_VOICE_REPLIES=true and ELEVENLABS_API_KEY is set.

import { getEnv } from "./env.ts";

export function voiceRepliesEnabled(): boolean {
  const env = getEnv();
  return env.WATHEFTI_VOICE_REPLIES === "true" && !!env.ELEVENLABS_API_KEY;
}

export async function synthesizeArabic(
  text: string,
): Promise<{ bytes: Uint8Array; contentType: string } | null> {
  const env = getEnv();
  if (!env.ELEVENLABS_API_KEY) return null;

  // Choose an Arabic-capable voice in your ElevenLabs library and set
  // ELEVENLABS_VOICE_ID; the default below is a generic multilingual voice.
  const voiceId = env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": env.ELEVENLABS_API_KEY,
          "content-type": "application/json",
          "accept": "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: env.ELEVENLABS_MODEL || "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      },
    );
    if (!res.ok) {
      console.error("[tts] ElevenLabs", res.status, await res.text());
      return null;
    }
    return { bytes: new Uint8Array(await res.arrayBuffer()), contentType: "audio/mpeg" };
  } catch (e) {
    console.error("[tts]", e);
    return null;
  }
}
