// Limits and accepted formats for recording uploads. Shared by the browser
// (early, friendly checks) and the API routes (the checks that actually count,
// since a client can skip its own).

export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB
export const MIN_UPLOAD_BYTES = 1024;
export const MAX_DURATION_SEC = 45 * 60; // 45 minutes

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
