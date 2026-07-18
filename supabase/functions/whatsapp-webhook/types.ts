// Shared types for the webhook pipeline.

export interface Inbound {
  from: string;
  to: string;
  body: string;
  numMedia: number;
  mediaUrl0: string;
  mediaType0: string;
  messageSid: string;
}

export interface Employer {
  name: string;
  duration?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  role_trade: string | null;
  employers: Employer[];
  skills: string[];
  tools: string[];
  achievement: string | null;
  raw_extracted: Record<string, unknown> | null;
  cv_pdf_path: string | null;
}

export interface InterviewerResult {
  profile_updates: Record<string, unknown>;
  reply_ar: string;
  profile_complete: boolean;
}

export interface HistoryTurn {
  direction: "inbound" | "outbound";
  medium: "voice" | "text";
  transcript: string;
  created_at: string;
}
