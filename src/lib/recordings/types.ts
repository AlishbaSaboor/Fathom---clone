/** What the process route returns for a recording: transcript, summary and action items. */
export interface ProcessedRecording {
  title: string;
  speakers: { id: string; name: string }[];
  transcript: { speakerId: string; start: number; text: string }[];
  summary: {
    purpose: string;
    takeaways: string[];
    topics: { title: string; summary: string; start: number }[];
    nextSteps: string[];
  };
  actionItems: { text: string; assigneeId: string | null; start: number }[];
  /** Which Gemini model produced it. */
  model: string;
}

/** Error body shape shared by all API routes. */
export interface ApiErrorBody {
  error: { kind: string; message: string; retryable?: boolean; retryAfterSec?: number };
}

export interface StartUploadRequest {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}
export interface StartUploadResponse {
  /** Pre-authorized Gemini upload URL. Contains no API key. */
  uploadUrl: string;
  /**
   * Random token stored in the Gemini file's display name. Lets the server find
   * the file afterwards even when the browser cannot read Gemini's upload
   * response (see uploadToGemini in client.ts).
   */
  token: string;
}

export interface FileStatusResponse {
  name: string;
  state: "PROCESSING" | "ACTIVE" | "FAILED";
}

export interface ProcessRequest {
  /** Gemini file resource name, e.g. "files/abc123". */
  fileName: string;
  durationSec: number;
}

export interface AskRequest {
  /** Seeded meeting id: the server looks up the transcript itself. */
  meetingId?: string;
  /** Transcript text for an uploaded meeting, which only exists in the browser. */
  transcript?: string;
  question: string;
  history?: { role: "user" | "assistant"; text: string }[];
}
export interface AskResponse {
  answer: string;
}
