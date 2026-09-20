// Limits and accepted formats for recording uploads. Shared by the browser
// (early, friendly checks) and the API routes (the checks that actually count,
// since a client can skip its own).

export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024; // 200 MB
export const MIN_UPLOAD_BYTES = 1024;
/**
 * Longest recording accepted, chosen from measurements (Gemini 3.5 Flash, one
 * transcription call, thinking off):
 *   16.4 min: complete transcript, 23 s.
 *   61.9 min: finished in 40 s but the transcript stopped at 29:56, i.e. under
 *   half of what was said, with a normal "STOP" finish. The first 30 minutes
 *   were accurate (97% of the words).
 * So the limit is about completeness, not the 300 s function time limit. A full
 * hour needs the recording transcribed in windows, not one call. 30 minutes is
 * the longest stretch seen transcribed faithfully; anything longer is refused
 * up front rather than silently truncated.
 */
export const MAX_DURATION_SEC = 30 * 60; // 30 minutes

/**
 * Compressed formats (MP3 especially) often report a length a fraction of a
 * second over the real one, so a 30:00 recording can read 1800.03 s. A few
 * seconds of slack keeps that from being refused as "30 min long, limit 30 min".
 */
export const DURATION_TOLERANCE_SEC = 5;
export const exceedsDurationLimit = (seconds: number) => seconds > MAX_DURATION_SEC + DURATION_TOLERANCE_SEC;

/**
 * Above this length, Gemini's "thinking" is switched off for the transcription
 * call. Measured on a 16-minute recording: thinking on took 85 s (19,000
 * thinking tokens, three times the visible output), off took 23 s with the same
 * transcript. Without this, a long recording would not finish inside the 300 s
 * a Vercel Hobby function is allowed to run.
 */
export const LOW_THINKING_ABOVE_SEC = 10 * 60;

export const MAX_QUESTION_CHARS = 500;
export const MAX_HISTORY_TURNS = 6;
export const MAX_HISTORY_CHARS = 2000;
export const MAX_TRANSCRIPT_CHARS = 300_000;

/**
 * Accepted formats: the intersection of what Gemini can transcribe and what a
 * browser can play back (uploads get a real player). Formats browsers cannot
 * play, such as AVI, WMV and FLV, are rejected with a "convert it" hint.
 * The MIME type Gemini receives comes from the extension, because browsers
 * report inconsistent types (for example video/quicktime for .mov).
 */
const BY_EXTENSION: Record<string, string> = {
  wav: "audio/wav",
  mp3: "audio/mp3",
  m4a: "audio/m4a",
  aac: "audio/aac",
  ogg: "audio/ogg",
  flac: "audio/flac",
  mp4: "video/mp4",
  mov: "video/mov",
  webm: "video/webm", // audio-only WebM is handled in resolveMimeType
};

export const ACCEPT_ATTRIBUTE = Object.keys(BY_EXTENSION)
  .map((e) => `.${e}`)
  .join(",");

export const ACCEPTED_FORMATS_LABEL = "MP3, WAV, M4A, AAC, OGG, FLAC, MP4, MOV or WebM";

/** All MIME types the server will accept for an upload session. */
export const ALLOWED_MIME_TYPES = new Set([...Object.values(BY_EXTENSION), "audio/webm"]);

/** The MIME type to send to Gemini for a file, or null if the format is not accepted. */
export function resolveMimeType(fileName: string, browserType = ""): string | null {
  const ext = fileName.toLowerCase().split(".").pop() ?? "";
  const mime = BY_EXTENSION[ext];
  if (!mime) return null;
  if (ext === "webm" && browserType.startsWith("audio/")) return "audio/webm";
  return mime;
}

export const isVideoMime = (mime: string) => mime.startsWith("video/");

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
