import "server-only";

export type GeminiErrorKind =
  | "config" // no API key on the server
  | "auth" // key rejected
  | "quota" // quota or billing limit
  | "busy" // 5xx from Gemini: overloaded, worth retrying later
  | "rate_limit" // 429 per-minute limit (free-tier keys allow only a few requests a minute per model)
  | "model_unavailable" // internal: this model id is not available to this key
  | "bad_request" // Gemini rejected the input (corrupt file, unsupported content)
  | "blocked" // safety/policy block
  | "empty" // no speech / nothing to transcribe
  | "bad_output" // model returned something unusable
  | "timeout"
  | "network"
  | "file_not_ready"
  | "file_failed"
  | "not_found"
  | "invalid_input" // our own validation (size, type, question length)
  | "rate_limited" // our own per-IP limit
  | "unauthorized" // no anonymous owner cookie on the request
  | "storage_full" // our own recording storage cap
  | "storage_unavailable" // database or file storage unreachable
  | "unknown";

const MESSAGES: Record<GeminiErrorKind, string> = {
  config:
    "This server has no Gemini API key configured. Add GEMINI_API_KEY to .env.local (or to your Vercel project's environment variables) and restart.",
  auth: "Gemini rejected the API key. Check that GEMINI_API_KEY is correct and enabled.",
  quota: "The Gemini API daily quota for this key has been reached. Try again tomorrow or check your plan.",
  rate_limit:
    "Gemini is rate limiting this API key right now (free-tier keys allow only a few requests per minute). Please wait a moment and try again.",
  busy: "Gemini is very busy right now. Your file is already uploaded, so you can retry in a minute without uploading again.",
  model_unavailable: "None of the configured Gemini models are available to this key.",
  bad_request: "Gemini couldn't process this file. It may be corrupted or use an unsupported codec.",
  blocked: "Gemini declined to process this content.",
  empty: "No speech was found in this recording, so there is nothing to transcribe.",
  bad_output: "Gemini returned a result that couldn't be read. Please try again.",
  timeout: "Gemini took too long to respond. Please try again.",
  network: "Couldn't reach the Gemini API. Check your connection and try again.",
  file_not_ready: "Gemini is still preparing your file. Try again in a few seconds.",
  file_failed: "Gemini couldn't process the uploaded file. Try a different file or format.",
  not_found: "That upload wasn't found. It may have expired, so please upload the file again.",
  invalid_input: "That request wasn't valid.",
  rate_limited: "You're going a bit fast. Please wait a moment and try again.",
  unauthorized: "Your browser session couldn't be identified. Reload the page and try again.",
  storage_full: "Recording storage is full right now, so this can't be saved. Delete an older recording and try again.",
  storage_unavailable: "Couldn't reach storage. Please try again in a moment.",
  unknown: "Something went wrong talking to Gemini. Please try again.",
};

const STATUS: Record<GeminiErrorKind, number> = {
  config: 500,
  auth: 502,
  quota: 429,
  rate_limit: 429,
  busy: 503,
  model_unavailable: 502,
  bad_request: 422,
  blocked: 422,
  empty: 422,
  bad_output: 502,
  timeout: 504,
  network: 502,
  file_not_ready: 409,
  file_failed: 422,
  not_found: 404,
  invalid_input: 400,
  rate_limited: 429,
  unauthorized: 401,
  storage_full: 507,
  storage_unavailable: 503,
  unknown: 500,
};

const RETRYABLE = new Set<GeminiErrorKind>([
  "busy",
  "rate_limit",
  "timeout",
  "network",
  "bad_output",
  "file_not_ready",
  "rate_limited",
  "storage_unavailable",
]);

/** An error whose message is safe to show to the user (never contains keys or raw upstream bodies). */
export class GeminiError extends Error {
  readonly kind: GeminiErrorKind;
  readonly httpStatus: number;
  readonly retryable: boolean;
  /** For rate limits: how long Gemini says to wait before trying again. */
  readonly retryAfterSec?: number;
  constructor(kind: GeminiErrorKind, message?: string, opts?: { retryAfterSec?: number }) {
    super(message ?? MESSAGES[kind]);
    this.name = "GeminiError";
    this.kind = kind;
    this.httpStatus = STATUS[kind];
    this.retryable = RETRYABLE.has(kind);
    this.retryAfterSec = opts?.retryAfterSec;
  }
}
