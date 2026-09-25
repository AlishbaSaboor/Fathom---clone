import "server-only";
import { randomBytes } from "node:crypto";
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_BYTES, MIN_UPLOAD_BYTES } from "@/lib/recordings/limits";
import { GEMINI_BASE_URL } from "./config";
import { GeminiError } from "./errors";
import { classifyFailure, geminiFetch } from "./request";

/** Gemini file resource names look like "files/abc123-def". Anything else is rejected before it reaches a URL. */
const FILE_NAME = /^files\/[a-z0-9][a-z0-9-]{0,39}$/i;
export const isValidFileName = (name: string) => FILE_NAME.test(name);

/**
 * Starts a resumable upload session and returns its pre-authorized URL. This
 * is the only step that needs the API key.
 */
async function startResumableUpload(input: { mimeType: string; sizeBytes: number }): Promise<string> {
  if (!ALLOWED_MIME_TYPES.has(input.mimeType)) throw new GeminiError("invalid_input", "That file type isn't supported.");
  if (!Number.isFinite(input.sizeBytes) || input.sizeBytes < MIN_UPLOAD_BYTES) {
    throw new GeminiError("invalid_input", "That file is empty or too small to be a recording.");
  }
  if (input.sizeBytes > MAX_UPLOAD_BYTES) {
    throw new GeminiError("invalid_input", "That file is too large.");
  }

  const res = await geminiFetch("/upload/v1beta/files", {
    method: "POST",
    headers: {
      "X-Goog-Upload-Protocol": "resumable",
      "X-Goog-Upload-Command": "start",
      "X-Goog-Upload-Header-Content-Length": String(input.sizeBytes),
      "X-Goog-Upload-Header-Content-Type": input.mimeType,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file: { display_name: `fathom-${randomBytes(6).toString("hex")}` } }),
  });
  if (!res.ok) throw classifyFailure(res.status, await res.text());

  const url = res.headers.get("x-goog-upload-url");
  if (!url || !url.startsWith(`${GEMINI_BASE_URL}/`)) throw new GeminiError("unknown");
  return url;
}

/**
 * Copies a stored recording to Gemini so it can be transcribed: the file is
 * streamed from its URL straight into a Gemini upload, never held in memory.
 * (The browser uploads only once, to Blob; this is the server-to-server leg.)
 * Returns the Gemini file's resource name, e.g. "files/abc123".
 */
export async function importToGemini(input: { sourceUrl: string; mimeType: string; sizeBytes: number }): Promise<string> {
  const uploadUrl = await startResumableUpload(input);

  let source: Response;
  try {
    source = await fetch(input.sourceUrl, { cache: "no-store", signal: AbortSignal.timeout(240_000) });
  } catch {
    throw new GeminiError("storage_unavailable");
  }
  if (!source.ok || !source.body) throw new GeminiError("storage_unavailable");

  let res: Response;
  try {
    res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Length": String(input.sizeBytes),
        "X-Goog-Upload-Offset": "0",
        "X-Goog-Upload-Command": "upload, finalize",
      },
      body: source.body,
      duplex: "half", // required by fetch for a streamed request body
      signal: AbortSignal.timeout(240_000),
    } as RequestInit & { duplex: "half" });
  } catch (e) {
    throw new GeminiError((e as Error)?.name === "TimeoutError" ? "timeout" : "network");
  }
  const text = await res.text();
  if (!res.ok) throw classifyFailure(res.status, text);

  const name = (JSON.parse(text) as { file?: { name?: string } }).file?.name;
  if (!name || !isValidFileName(name)) throw new GeminiError("unknown");
  return name;
}

export interface GeminiFile {
  name: string;
  uri: string;
  mimeType: string;
  sizeBytes: number;
  state: "PROCESSING" | "ACTIVE" | "FAILED";
}

export async function getFile(name: string): Promise<GeminiFile> {
  if (!isValidFileName(name)) throw new GeminiError("invalid_input", "That upload reference isn't valid.");
  const res = await geminiFetch(`/v1beta/${name}`, { timeoutMs: 20_000 });
  const text = await res.text();
  // Gemini answers 403 for a file that doesn't exist or was already deleted, so
  // don't blame the API key unless the body actually says it is invalid.
  if ((res.status === 403 || res.status === 404) && !/api key/i.test(text)) throw new GeminiError("not_found");
  if (!res.ok) throw classifyFailure(res.status, text);
  const f = JSON.parse(text) as { name?: string; uri?: string; mimeType?: string; sizeBytes?: string; state?: string };
  return {
    name: f.name ?? name,
    uri: f.uri ?? "",
    mimeType: f.mimeType ?? "",
    sizeBytes: Number(f.sizeBytes ?? 0),
    state: f.state === "ACTIVE" ? "ACTIVE" : f.state === "FAILED" ? "FAILED" : "PROCESSING",
  };
}

/** Best effort: the recording is no longer needed once analyzed, and Gemini also expires files after 48 hours. */
export async function deleteFile(name: string): Promise<void> {
  if (!isValidFileName(name)) return;
  try {
    await geminiFetch(`/v1beta/${name}`, { method: "DELETE", timeoutMs: 15_000 });
  } catch {
    // ignore: cleanup must never turn a successful analysis into an error
  }
}
