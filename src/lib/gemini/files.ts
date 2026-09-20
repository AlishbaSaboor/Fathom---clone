import "server-only";
import { randomBytes } from "node:crypto";
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_BYTES, MIN_UPLOAD_BYTES } from "@/lib/recordings/limits";
import { GEMINI_BASE_URL, getApiKey } from "./config";
import { GeminiError } from "./errors";
import { classifyFailure, geminiFetch } from "./request";

/** Gemini file resource names look like "files/abc123-def". Anything else is rejected before it reaches a URL. */
const FILE_NAME = /^files\/[a-z0-9][a-z0-9-]{0,39}$/i;
export const isValidFileName = (name: string) => FILE_NAME.test(name);

/**
 * Starts a resumable upload session and returns its URL. This is the only step
 * that needs the API key. The returned URL is pre-authorized and contains no
 * key, so the browser can send the file straight to Gemini: recordings never
 * pass through this server (Vercel limits request bodies to 4.5 MB).
 */
export const TOKEN_PATTERN = /^[a-f0-9]{24}$/;
const displayNameFor = (token: string) => `fathom-${token}`;

export async function startResumableUpload(input: {
  mimeType: string;
  sizeBytes: number;
}): Promise<{ uploadUrl: string; token: string }> {
  if (!ALLOWED_MIME_TYPES.has(input.mimeType)) throw new GeminiError("invalid_input", "That file type isn't supported.");
  if (!Number.isFinite(input.sizeBytes) || input.sizeBytes < MIN_UPLOAD_BYTES) {
    throw new GeminiError("invalid_input", "That file is empty or too small to be a recording.");
  }
  if (input.sizeBytes > MAX_UPLOAD_BYTES) {
    throw new GeminiError("invalid_input", "That file is too large.");
  }

  const token = randomBytes(12).toString("hex");
  const res = await geminiFetch("/upload/v1beta/files", {
    method: "POST",
    headers: {
      "X-Goog-Upload-Protocol": "resumable",
      "X-Goog-Upload-Command": "start",
      "X-Goog-Upload-Header-Content-Length": String(input.sizeBytes),
      "X-Goog-Upload-Header-Content-Type": input.mimeType,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file: { display_name: displayNameFor(token) } }),
  });
  if (!res.ok) throw classifyFailure(res.status, await res.text());

  const url = res.headers.get("x-goog-upload-url");
  if (!url || !url.startsWith(`${GEMINI_BASE_URL}/`)) throw new GeminiError("unknown");
  // Defense in depth: never hand the browser a URL that carries the key.
  if (url.includes(getApiKey())) throw new GeminiError("unknown");
  return { uploadUrl: url, token };
}

/**
 * Finds an uploaded file by the token in its display name. Gemini's upload
 * server answers the final upload request without a CORS header, so the browser
 * can send the whole file but cannot read the reply that names it; this lets it
 * ask us instead.
 */
export async function findFileByToken(token: string): Promise<GeminiFile> {
  if (!TOKEN_PATTERN.test(token)) throw new GeminiError("invalid_input", "That upload reference isn't valid.");
  const wanted = displayNameFor(token);
  let pageToken = "";
  for (let page = 0; page < 5; page++) {
    const res = await geminiFetch(`/v1beta/files?pageSize=100${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`, {
      timeoutMs: 20_000,
    });
    const text = await res.text();
    if (!res.ok) throw classifyFailure(res.status, text);
    const body = JSON.parse(text) as { files?: (Record<string, string> & { displayName?: string })[]; nextPageToken?: string };
    const hit = body.files?.find((f) => f.displayName === wanted);
    if (hit) {
      return {
        name: hit.name,
        uri: hit.uri ?? "",
        mimeType: hit.mimeType ?? "",
        sizeBytes: Number(hit.sizeBytes ?? 0),
        state: hit.state === "ACTIVE" ? "ACTIVE" : hit.state === "FAILED" ? "FAILED" : "PROCESSING",
      };
    }
    if (!body.nextPageToken) break;
    pageToken = body.nextPageToken;
  }
  throw new GeminiError("not_found");
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
