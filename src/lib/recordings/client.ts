"use client";

import { formatDuration } from "@/lib/format";
import {
  ACCEPTED_FORMATS_LABEL,
  MAX_DURATION_SEC,
  MAX_UPLOAD_BYTES,
  MIN_UPLOAD_BYTES,
  exceedsDurationLimit,
  formatBytes,
  resolveMimeType,
} from "./limits";
import type { ApiErrorBody, FileStatusResponse, ProcessedRecording, StartUploadResponse } from "./types";

interface FoundFile {
  name: string;
  state: string;
}

// The browser side of an upload. The recording goes straight from the browser
// to Gemini (Vercel would reject a body over 4.5 MB); our server only starts
// the upload session (it holds the API key), checks on the file, and asks
// Gemini to transcribe it.

export type Stage = "starting" | "uploading" | "preparing" | "analyzing";

export interface Progress {
  stage: Stage;
  /** 0-100, only while uploading. */
  percent?: number;
}

/** An error with a message that is safe and useful to show as-is. */
export class UploadError extends Error {
  constructor(
    message: string,
    readonly retryable = false,
    readonly retryAfterSec?: number,
  ) {
    super(message);
    this.name = "UploadError";
  }
}

/**
 * Carries state between attempts so a retry after a failed analysis does not
 * upload the file again: once Gemini has the file, only the analysis is repeated.
 */
export interface UploadSession {
  mimeType: string;
  durationSec: number;
  geminiFileName?: string;
}

/** A friendly message if the file can't be used, otherwise null. Cheap checks only. */
export function checkFile(file: File): string | null {
  if (!resolveMimeType(file.name, file.type)) {
    return `That file type isn't supported. Use ${ACCEPTED_FORMATS_LABEL}. (Formats like AVI and WMV can't be played in a browser; convert them to MP4 or MP3 first.)`;
  }
  if (file.size < MIN_UPLOAD_BYTES) return "That file is empty or too small to be a recording.";
  if (file.size > MAX_UPLOAD_BYTES) {
    return `That file is ${formatBytes(file.size)}, which is over the ${formatBytes(MAX_UPLOAD_BYTES)} limit. Try a shorter recording or a smaller format like MP3.`;
  }
  return null;
}

/** Reads the length of an audio/video file using the browser itself, which also proves it can be played back. */
export function measureDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement(file.type.startsWith("audio/") ? "audio" : "video");
    let done = false;
    const finish = (fn: () => void) => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      el.removeAttribute("src");
      el.load();
      URL.revokeObjectURL(url);
      fn();
    };
    const fail = () =>
      finish(() =>
        reject(new UploadError("This browser can't read that file. It may be corrupted or use a codec the browser doesn't support.")),
      );
    const timer = window.setTimeout(fail, 15_000);

    el.preload = "metadata";
    el.onerror = fail;
    // Read the duration BEFORE finish() runs: finish() resets the element, after
    // which el.duration is NaN.
    el.onloadedmetadata = () => {
      const d = el.duration;
      if (Number.isFinite(d) && d > 0) return finish(() => resolve(d));
      // Some WebM files report Infinity until you seek to the end.
      el.currentTime = 1e101;
      el.ontimeupdate = () => {
        el.ontimeupdate = null;
        const seeked = el.duration;
        if (Number.isFinite(seeked) && seeked > 0) finish(() => resolve(seeked));
        else fail();
      };
    };
    el.src = url;
  });
}

async function readApiError(res: Response): Promise<UploadError> {
  let body: Partial<ApiErrorBody> = {};
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    // not JSON (e.g. a platform error page)
  }
  if (body.error?.message) return new UploadError(body.error.message, !!body.error.retryable, body.error.retryAfterSec);
  if (res.status === 413) return new UploadError("The server rejected that request as too large.");
  return new UploadError("Something went wrong on the server. Please try again.", res.status >= 500);
}

async function api<T>(path: string, init: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, init);
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new UploadError("Couldn't reach the server. Check your connection and try again.", true);
  }
  if (!res.ok) throw await readApiError(res);
  return (await res.json()) as T;
}

/**
 * Sends the bytes to the pre-authorized Gemini upload URL, reporting progress.
 *
 * Gemini's upload server answers the final request WITHOUT a CORS header, so
 * even when the upload succeeds the browser blocks this code from reading the
 * reply (which is where the file's name would be). Error replies do carry the
 * header, so they stay readable. We can still tell that every byte was
 * delivered (the request body finished sending), so in that case we resolve
 * without a name and the caller asks our server to look the file up by token.
 */
function uploadToGemini(
  uploadUrl: string,
  file: File,
  onPercent: (p: number) => void,
  signal: AbortSignal,
): Promise<{ name?: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let bodySent = false;
    xhr.open("POST", uploadUrl);
    xhr.setRequestHeader("X-Goog-Upload-Offset", "0");
    xhr.setRequestHeader("X-Goog-Upload-Command", "upload, finalize");
    xhr.upload.onprogress = (e) => e.lengthComputable && onPercent(Math.round((e.loaded / e.total) * 100));
    xhr.upload.onload = () => {
      bodySent = true;
      onPercent(100);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const name = JSON.parse(xhr.responseText)?.file?.name as string | undefined;
          return resolve({ name });
        } catch {
          return resolve({});
        }
      }
      reject(new UploadError("The upload was rejected. Please try again or use a different file.", xhr.status >= 500));
    };
    xhr.onerror = () => {
      if (bodySent) return resolve({}); // delivered; only the reply was unreadable (see above)
      reject(new UploadError("The upload was interrupted. Check your connection and try again.", true));
    };
    xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"));
    signal.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(file);
  });
}

/** Asks the server for the uploaded file's name, retrying briefly while Gemini finishes registering it. */
async function confirmUpload(token: string, signal: AbortSignal): Promise<string> {
  for (let i = 0; i < 12; i++) {
    try {
      const found = await api<FoundFile>(`/api/recordings/find?token=${encodeURIComponent(token)}`, { signal });
      return found.name;
    } catch (e) {
      if (!(e instanceof UploadError) || !/wasn't found/i.test(e.message)) throw e;
      await sleep(1500, signal);
    }
  }
  throw new UploadError("The upload finished but couldn't be confirmed. Please try again.", true);
}

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = window.setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(t);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });

/**
 * Upload (unless this session already did), wait for Gemini to prepare the
 * file, then transcribe and summarize it. Throws UploadError for anything the
 * user should see, and AbortError when cancelled.
 */
export async function processRecording(
  file: File,
  session: UploadSession,
  onProgress: (p: Progress) => void,
  signal: AbortSignal,
): Promise<ProcessedRecording> {
  if (exceedsDurationLimit(session.durationSec)) {
    throw new UploadError(`That recording is longer than ${formatDuration(MAX_DURATION_SEC)}. Try a shorter one.`);
  }

  if (!session.geminiFileName) {
    onProgress({ stage: "starting" });
    const { uploadUrl, token } = await api<StartUploadResponse>("/api/recordings/start-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mimeType: session.mimeType, sizeBytes: file.size }),
      signal,
    });
    onProgress({ stage: "uploading", percent: 0 });
    const uploaded = await uploadToGemini(uploadUrl, file, (percent) => onProgress({ stage: "uploading", percent }), signal);
    session.geminiFileName = uploaded.name ?? (await confirmUpload(token, signal));
  }

  onProgress({ stage: "preparing" });
  const MAX_POLLS = 180; // x 2 s = up to 6 minutes; big video files take a while to prepare
  for (let i = 0; i < MAX_POLLS; i++) {
    const status = await api<FileStatusResponse>(`/api/recordings/file?name=${encodeURIComponent(session.geminiFileName)}`, { signal }).catch(
      (e) => {
        // The file vanished (expired or deleted): forget it so a retry uploads again.
        if (e instanceof UploadError && /wasn't found/i.test(e.message)) session.geminiFileName = undefined;
        throw e;
      },
    );
    if (status.state === "ACTIVE") break;
    if (status.state === "FAILED") {
      session.geminiFileName = undefined;
      throw new UploadError("Gemini couldn't process that file. Try a different file or format.");
    }
    if (i === MAX_POLLS - 1) throw new UploadError("Gemini is taking too long to prepare the file. Please try again.", true);
    await sleep(2000, signal);
  }

  onProgress({ stage: "analyzing" });
  try {
    return await api<ProcessedRecording>("/api/recordings/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: session.geminiFileName, durationSec: Math.ceil(session.durationSec) }),
      signal,
    });
  } catch (e) {
    if (e instanceof UploadError && /wasn't found/i.test(e.message)) session.geminiFileName = undefined;
    throw e;
  }
}
