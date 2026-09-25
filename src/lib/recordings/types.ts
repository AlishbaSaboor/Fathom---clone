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

/** Step 1: registers a recording so the browser may upload it. The server decides where it goes and what it may be. */
export interface CreateUploadRequest {
  fileName: string;
  /** The type the browser reports (only used to tell audio-only WebM from video). */
  browserType: string;
  sizeBytes: number;
  durationSec: number;
}
export interface CreateUploadResponse {
  meetingId: string;
  /** Where in Blob storage the file must be uploaded. */
  pathname: string;
  /** The content type the upload must be sent with. */
  contentType: string;
}

/** Step 2 (server to server): copy the stored recording to Gemini. */
export interface ImportRequest {
  meetingId: string;
}
export interface ImportResponse {
  /** Gemini file resource name, e.g. "files/abc123". */
  fileName: string;
}

export interface FileStatusResponse {
  name: string;
  state: "PROCESSING" | "ACTIVE" | "FAILED";
}

export interface ProcessRequest {
  meetingId: string;
}
/** The analysis is saved by the server; the browser just gets told where to find it. */
export interface ProcessResponse {
  meetingId: string;
  shareToken: string;
}

export interface AskRequest {
  /** The call's share token: the server looks up the transcript itself. */
  shareToken: string;
  question: string;
  history?: { role: "user" | "assistant"; text: string }[];
}
export interface AskResponse {
  answer: string;
}

/** Account-level Ask Fathom: one question across every call, answered from summaries. */
export interface AskAllRequest {
  question: string;
  history?: { role: "user" | "assistant"; text: string }[];
  /** The visitor's local date (YYYY-MM-DD), so "looming deadlines" is judged against today. */
  today?: string;
}
export interface AskAllResponse {
  answer: string;
  followUps: string[];
  /** How many calls the answer was based on. */
  analyzed: number;
}
