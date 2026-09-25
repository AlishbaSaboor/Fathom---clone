"use client";

import { upload } from "@vercel/blob/client";
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
import type {
  ApiErrorBody,
  CreateUploadResponse,
  FileStatusResponse,
  ImportResponse,
  ProcessResponse,
} from "./types";

// The browser side of an upload. The recording goes from the browser straight
// to Vercel Blob (Vercel would reject a function request body over 4.5 MB) and
// is uploaded once. Our server then copies it from Blob to Gemini, waits for
// Gemini to be ready, and has it transcribed and saved:
//
//   1. register   the server checks the file and picks where it goes in Blob
//   2. upload     browser -> Blob, with a short-lived token for that one file
//   3. import     server: Blob -> Gemini
//   4. prepare    wait for Gemini to finish preparing the file
//   5. process    Gemini transcribes and summarizes; the server saves the result

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
 * Carries state between attempts so a retry does not redo finished work: a file
 * that is already in Blob is not uploaded again, and one Gemini already has is
 * not copied again.
 */
export interface UploadSession {
  durationSec: number;
  meetingId?: string;
  pathname?: string;
  contentType?: string;
  uploaded?: boolean;
  geminiFileName?: string;
}

/** Forget a recording the server no longer has, so the next attempt registers and uploads it afresh. */
function forgetRecording(session: UploadSession) {
  session.meetingId = session.pathname = session.contentType = session.geminiFileName = undefined;
  session.uploaded = false;
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

/** Uploads at least this big go to Blob in parallel parts, which is faster and retries a failed part on its own. */
const MULTIPART_ABOVE_BYTES = 10 * 1024 * 1024;

const post = <T>(path: string, body: unknown, signal: AbortSignal) =>
  api<T>(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal });

/**
 * Runs the five steps above, skipping any this session already finished. Throws
 * UploadError for anything the user should see, and AbortError when cancelled.
 * Resolves with the id of the saved meeting and its share token.
 */
export async function processRecording(
  file: File,
  session: UploadSession,
  onProgress: (p: Progress) => void,
  signal: AbortSignal,
): Promise<ProcessResponse> {
  if (exceedsDurationLimit(session.durationSec)) {
    throw new UploadError(`That recording is longer than ${formatDuration(MAX_DURATION_SEC)}. Try a shorter one.`);
  }

  // 1. register
  if (!session.meetingId) {
    onProgress({ stage: "starting" });
    const created = await post<CreateUploadResponse>(
      "/api/recordings/create",
      { fileName: file.name, browserType: file.type, sizeBytes: file.size, durationSec: session.durationSec },
      signal,
    );
    session.meetingId = created.meetingId;
    session.pathname = created.pathname;
    session.contentType = created.contentType;
  }

  // 2. upload
  if (!session.uploaded) {
    onProgress({ stage: "uploading", percent: 0 });
    try {
      await upload(session.pathname!, file, {
        access: "public",
        handleUploadUrl: "/api/blob/upload",
        clientPayload: session.meetingId,
        contentType: session.contentType,
        multipart: file.size > MULTIPART_ABOVE_BYTES,
        abortSignal: signal,
        onUploadProgress: ({ percentage }) => onProgress({ stage: "uploading", percent: Math.round(percentage) }),
      });
    } catch (e) {
      if (signal.aborted || (e as Error).name === "AbortError") throw new DOMException("Aborted", "AbortError");
      // A previous attempt may have delivered the whole file and only lost the reply; the server checks the file itself in the next step.
      if (!/already exists/i.test((e as Error).message ?? "")) {
        throw new UploadError("The upload was interrupted. Check your connection and try again.", true);
      }
    }
    session.uploaded = true;
    onProgress({ stage: "uploading", percent: 100 });
  }

  // 3. import (server: Blob -> Gemini)
  onProgress({ stage: "preparing" });
  if (!session.geminiFileName) {
    try {
      session.geminiFileName = (await post<ImportResponse>("/api/recordings/import", { meetingId: session.meetingId }, signal)).fileName;
    } catch (e) {
      if (e instanceof UploadError && /wasn't found/i.test(e.message)) forgetRecording(session);
      throw e;
    }
  }

  // 4. prepare
  const MAX_POLLS = 180; // x 2 s = up to 6 minutes; big video files take a while to prepare
  for (let i = 0; i < MAX_POLLS; i++) {
    const status = await api<FileStatusResponse>(`/api/recordings/file?name=${encodeURIComponent(session.geminiFileName)}`, { signal }).catch(
      (e) => {
        // The file vanished (expired or deleted): forget it so a retry copies it to Gemini again.
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

  // 5. process
  onProgress({ stage: "analyzing" });
  try {
    return await post<ProcessResponse>("/api/recordings/process", { meetingId: session.meetingId }, signal);
  } catch (e) {
    if (e instanceof UploadError && /wasn't found/i.test(e.message)) session.geminiFileName = undefined;
    throw e;
  }
}
