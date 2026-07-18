// Groq Whisper transcription (OpenAI-compatible audio endpoint).
// Arabic-dialect voice note -> text.

import { getEnv } from "./env.ts";

export async function transcribeAudio(bytes: Uint8Array, contentType: string): Promise<string> {
  const env = getEnv();
  if (!env.GROQ_API_KEY) {
    console.error("[groq] GROQ_API_KEY not set; skipping transcription");
    return "";
  }

  const form = new FormData();
  const blob = new Blob([bytes], { type: contentType || "audio/ogg" });
  form.append("file", blob, "voice-note.ogg");
  form.append("model", env.GROQ_MODEL);
  form.append("language", "ar"); // Arabic; Whisper still handles dialect variation
  form.append("response_format", "json");
  // A short prompt biases Whisper toward the domain vocabulary.
  form.append("prompt", "محادثة عن العمل والخبرة المهنية والمهارات");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.GROQ_API_KEY}` },
    body: form,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Groq transcription failed ${res.status}: ${t}`);
  }
  const data = await res.json();
  return String(data.text ?? "").trim();
}
