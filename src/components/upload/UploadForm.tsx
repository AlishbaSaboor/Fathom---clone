"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlertIcon, CheckIcon, UploadIcon, XIcon } from "@/components/ui/icons";
import { formatDuration } from "@/lib/format";
import {
  UploadError,
  checkFile,
  measureDuration,
  processRecording,
  type Progress,
  type UploadSession,
} from "@/lib/recordings/client";
import {
  ACCEPTED_FORMATS_LABEL,
  ACCEPT_ATTRIBUTE,
  MAX_DURATION_SEC,
  MAX_UPLOAD_BYTES,
  exceedsDurationLimit,
  formatBytes,
  resolveMimeType,
} from "@/lib/recordings/limits";
import { StorageFullError, deleteMedia, saveMedia, saveUpload } from "@/lib/recordings/storage";
import { buildMeeting } from "@/lib/recordings/toMeeting";

type Status = "idle" | "running" | "error";
type Step = "upload" | "prepare" | "analyze" | "save";

const STEPS: { id: Step; label: string }[] = [
  { id: "upload", label: "Uploading your recording" },
  { id: "prepare", label: "Preparing it for transcription" },
  { id: "analyze", label: "Transcribing and summarizing" },
  { id: "save", label: "Saving your result" },
];

const newId = () => `up-${(globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)).slice(0, 12)}`;

export function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [measuring, setMeasuring] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [status, setStatus] = useState<Status>("idle");
  const [step, setStep] = useState<Step>("upload");
  const [percent, setPercent] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<UploadError | null>(null);
  const [alreadyUploaded, setAlreadyUploaded] = useState(false);

  const session = useRef<UploadSession | null>(null);
  const abort = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Counts file choices so a slow measurement of an earlier file can't overwrite a later choice.
  const choiceId = useRef(0);

  // Ticks only while Gemini is working, to show how long it has been.
  useEffect(() => {
    if (status !== "running" || step !== "analyze") return;
    const started = Date.now();
    const t = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => window.clearInterval(t);
  }, [status, step]);

  // Leaving mid-upload would lose the work, so ask first.
  useEffect(() => {
    if (status !== "running") return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  async function choose(f: File | undefined) {
    if (!f || status === "running") return;
    const mine = ++choiceId.current;
    setFile(f);
    setDurationSec(null);
    setError(null);
    setStatus("idle");
    session.current = null;

    const bad = checkFile(f);
    if (bad) return setProblem(bad);
    setProblem(null);
    setMeasuring(true);
    try {
      const d = await measureDuration(f);
      if (mine !== choiceId.current) return; // a newer file was chosen meanwhile
      if (exceedsDurationLimit(d)) {
        setProblem(`That recording is ${formatDuration(d)} long. The limit is ${formatDuration(MAX_DURATION_SEC)}.`);
      } else {
        setDurationSec(d);
        session.current = { mimeType: resolveMimeType(f.name, f.type)!, durationSec: d };
      }
    } catch (e) {
      if (mine !== choiceId.current) return;
      setProblem(e instanceof UploadError ? e.message : "This browser can't read that file.");
    } finally {
      if (mine === choiceId.current) setMeasuring(false);
    }
  }

  function clear() {
    if (status === "running") return;
    choiceId.current++; // ignore any measurement still in flight
    setFile(null);
    setDurationSec(null);
    setProblem(null);
    setError(null);
    setStatus("idle");
    session.current = null;
    if (inputRef.current) inputRef.current.value = "";
  }

  function onProgress(p: Progress) {
    if (p.stage === "uploading") {
      setStep("upload");
      setPercent(p.percent ?? 0);
    } else if (p.stage === "starting") {
      setStep("upload");
      setPercent(0);
    } else {
      setStep(p.stage === "preparing" ? "prepare" : "analyze");
    }
  }

  async function run() {
    if (!file || !session.current || status === "running") return;
    const ac = new AbortController();
    abort.current = ac;
    setStatus("running");
    setError(null);
    setStep("upload");
    setPercent(0);
    setElapsed(0);

    try {
      const processed = await processRecording(file, session.current, onProgress, ac.signal);

      setStep("save");
      const id = newId();
      const meeting = buildMeeting(processed, {
        id,
        createdAt: new Date().toISOString(),
        durationSec: Math.max(session.current.durationSec, processed.transcript.at(-1)?.start ?? 0),
        fileName: file.name,
        mimeType: session.current.mimeType,
        sizeBytes: file.size,
      });
      // The recording goes in IndexedDB. If that fails (private mode, quota) the
      // transcript and summary are still saved; the page just has no player.
      await saveMedia(id, file).catch(() => undefined);
      try {
        saveUpload(meeting);
      } catch (e) {
        await deleteMedia(id).catch(() => undefined);
        throw e instanceof StorageFullError ? new UploadError(e.message) : e;
      }
      router.push(`/uploads/${id}`);
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setStatus("idle");
        return;
      }
      setError(e instanceof UploadError ? e : new UploadError("Something went wrong. Please try again.", true));
      setAlreadyUploaded(!!session.current?.geminiFileName);
      setStatus("error");
    }
  }

  function cancel() {
    abort.current?.abort();
  }

  const running = status === "running";
  const ready = !!file && !!durationSec && !problem && !measuring;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Upload a recording</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Get a real transcript, summary and action items from an audio or video file.
      </p>

      {/* file picker / drop zone */}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          if (!running) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void choose(e.dataTransfer.files[0]);
        }}
        className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-600 ${
          dragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40"
            : "border-zinc-300 hover:border-blue-400 dark:border-zinc-700"
        } ${running ? "pointer-events-none opacity-60" : ""}`}
      >
        <UploadIcon className="h-8 w-8 text-blue-600 dark:text-blue-300" />
        <span className="mt-3 text-sm font-medium">
          {file ? "Choose a different file" : "Choose an audio or video file, or drop it here"}
        </span>
        <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {ACCEPTED_FORMATS_LABEL} · up to {formatBytes(MAX_UPLOAD_BYTES)} and {formatDuration(MAX_DURATION_SEC)}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          disabled={running}
          onChange={(e) => void choose(e.target.files?.[0])}
          className="sr-only"
          aria-label="Choose an audio or video file"
        />
      </label>

      {/* selected file */}
      {file && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="min-w-0">
            <p className="truncate font-medium">{file.name}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {formatBytes(file.size)}
              {measuring && " · reading file…"}
              {durationSec ? ` · ${formatDuration(durationSec)}` : ""}
            </p>
          </div>
          {!running && (
            <button
              type="button"
              onClick={clear}
              aria-label="Remove file"
              className="rounded p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {problem && (
        <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:bg-rose-950/50 dark:text-rose-200">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {problem}
        </p>
      )}

      {/* error */}
      {status === "error" && error && (
        <div role="alert" className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-100">
          <p className="flex items-start gap-2 font-medium">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            {error.message}
          </p>
          {error.retryable && alreadyUploaded && !/already uploaded/i.test(error.message) && (
            <p className="mt-2 text-xs opacity-80">Your file is already uploaded, so trying again won&rsquo;t upload it a second time.</p>
          )}
          {!error.retryable && (
            <button type="button" onClick={clear} className="mt-2 text-xs font-semibold underline">
              Choose a different file
            </button>
          )}
        </div>
      )}

      {/* process */}
      {status !== "running" && (
        <div className={status === "error" ? "mt-4" : "mt-6"}>
          <button
            type="button"
            onClick={run}
            disabled={!ready}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {status === "error" && error?.retryable ? "Try again" : "Process"}
          </button>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            Your recording is sent to Google&rsquo;s Gemini API to be transcribed, and is deleted from Gemini once
            processing finishes. The recording itself stays only in this browser. The transcript, summary and action
            items are also saved on our server for 30 days so the upload gets a share link: anyone with that link can
            read them, and it can&rsquo;t be revoked early.
          </p>
        </div>
      )}

      {/* progress */}
      {running && (
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900" aria-live="polite">
          <ol className="space-y-3">
            {STEPS.map((s, i) => {
              const current = STEPS.findIndex((x) => x.id === step);
              const state = i < current ? "done" : i === current ? "active" : "todo";
              return (
                <li key={s.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                    {state === "done" ? (
                      <CheckIcon className="h-4 w-4 text-emerald-600" />
                    ) : state === "active" ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" role="status" aria-label="In progress" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={state === "todo" ? "text-zinc-400 dark:text-zinc-500" : "font-medium"}>{s.label}</p>
                    {state === "active" && s.id === "upload" && (
                      <div className="mt-2">
                        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                          <div className="h-full rounded-full bg-blue-600 transition-[width]" style={{ width: `${percent}%` }} />
                        </div>
                        <p className="mt-1 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">{percent}%</p>
                      </div>
                    )}
                    {state === "active" && s.id === "analyze" && (
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {elapsed}s elapsed.{" "}
                        {elapsed < 60
                          ? "This usually takes 30 to 40 seconds."
                          : "Gemini is busy right now, so this is taking longer. Still working…"}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          <button
            type="button"
            onClick={cancel}
            className="mt-5 text-sm font-medium text-zinc-500 underline hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Cancel
          </button>
        </div>
      )}

    </div>
  );
}
