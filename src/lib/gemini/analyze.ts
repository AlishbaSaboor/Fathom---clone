import "server-only";
import { formatDuration } from "@/lib/format";
import { LOW_THINKING_ABOVE_SEC, MAX_DURATION_SEC, exceedsDurationLimit } from "@/lib/recordings/limits";
import { normalizeAnalysis, transcriptCoverage } from "@/lib/recordings/normalize";
import type { ProcessedRecording } from "@/lib/recordings/types";
import { GeminiError } from "./errors";
import { deleteFile, getFile } from "./files";
import { generateWithFallback } from "./request";

// One call returns the transcript, title, summary and action items together,
// as JSON constrained to this schema.
const STRING = { type: "STRING" };
const RECORDING_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: STRING,
    speakers: {
      type: "ARRAY",
      items: { type: "OBJECT", properties: { id: STRING, name: STRING }, required: ["id", "name"] },
    },
    transcript: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { speaker: STRING, start: STRING, text: STRING },
        required: ["speaker", "start", "text"],
      },
    },
    summary: {
      type: "OBJECT",
      properties: {
        purpose: STRING,
        takeaways: { type: "ARRAY", items: STRING },
        topics: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: { title: STRING, summary: STRING, start: STRING },
            required: ["title", "summary", "start"],
          },
        },
        nextSteps: { type: "ARRAY", items: STRING },
      },
      required: ["purpose", "takeaways", "topics", "nextSteps"],
    },
    actionItems: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { text: STRING, assignee: STRING, start: STRING },
        required: ["text", "assignee", "start"],
      },
    },
  },
  required: ["title", "speakers", "transcript", "summary", "actionItems"],
};

const PROMPT = `You are a meeting notetaker. Listen to the whole recording and return JSON only.

- transcript: a faithful, speaker-labelled transcript. One entry per speaker turn (merge consecutive sentences by the same speaker). "start" is when the turn begins, formatted M:SS (or H:MM:SS past one hour). "speaker" must be an id from "speakers".
- speakers: one entry per distinct voice. A name spoken in conversation usually refers to the person being addressed or talked about, not the person speaking, so only use a real name for a voice when that person introduces themselves or it is unmistakable from context; otherwise use "Speaker 1", "Speaker 2", and so on. Never create a speaker for someone who is only mentioned.
- title: a short descriptive meeting title (at most 8 words).
- summary.purpose: 1-2 sentences on why the meeting happened.
- summary.takeaways: 3-6 concise bullets of the most important points and decisions.
- summary.topics: the main topics discussed, each with a one-sentence summary and the M:SS where it starts.
- summary.nextSteps: concrete follow-ups agreed in the meeting.
- actionItems: tasks someone committed to. "assignee" is a speaker id, or "" if unclear. "start" is when it was said.

Write in the same language as the recording. Do not invent anything that is not in the recording. If there is no speech, return an empty transcript.`;

/**
 * Transcribes and summarizes an uploaded recording that is already on Gemini.
 * The file is deleted afterwards on success. On failure it is kept so the
 * browser can retry without uploading again (Gemini expires it after 48h).
 */
export async function analyzeRecording(fileName: string, durationSec: number): Promise<ProcessedRecording> {
  const startedAt = Date.now();
  if (!Number.isFinite(durationSec) || durationSec <= 0 || exceedsDurationLimit(durationSec)) {
    throw new GeminiError("invalid_input", `That recording is too long. The limit is ${formatDuration(MAX_DURATION_SEC)}.`);
  }

  const file = await getFile(fileName);
  if (file.state === "FAILED") throw new GeminiError("file_failed");
  if (file.state !== "ACTIVE") throw new GeminiError("file_not_ready");

  const contents = [
    { role: "user", parts: [{ text: PROMPT }, { fileData: { mimeType: file.mimeType, fileUri: file.uri } }] },
  ];
  const generationConfig: Record<string, unknown> = {
    responseMimeType: "application/json",
    responseSchema: RECORDING_SCHEMA,
    temperature: 0.2,
    // Long recordings: no "thinking", or the call cannot finish inside the function's time limit.
    ...(durationSec > LOW_THINKING_ABOVE_SEC ? { thinkingConfig: { thinkingLevel: "minimal" } } : {}),
  };

  // Time budget. A Vercel Hobby function may run 300 s (maxDuration in the route);
  // stay inside it with a margin. One attempt on a long recording takes minutes,
  // so give each attempt room, but never start one that cannot finish.
  const totalBudgetMs = 270_000;
  const attemptTimeoutMs = Math.min(240_000, Math.max(100_000, 60_000 + durationSec * 45));
  const minAttemptMs = Math.min(attemptTimeoutMs, 30_000 + durationSec * 25);

  // Structured output can still come back truncated or malformed; retry once.
  let lastError: GeminiError = new GeminiError("bad_output");
  for (let attempt = 1; attempt <= 2; attempt++) {
    // One budget for the whole request, shared with the malformed-output retry, so
    // the total can never run past the function's time limit.
    const budgetMs = totalBudgetMs - (Date.now() - startedAt);
    if (attempt > 1 && budgetMs < minAttemptMs) throw lastError;
    const { text, model } = await generateWithFallback({ contents, generationConfig, budgetMs, attemptTimeoutMs, minAttemptMs });
    let raw: unknown;
    try {
      raw = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""));
    } catch {
      lastError = new GeminiError("bad_output");
      continue;
    }
    const result = normalizeAnalysis(raw, durationSec, model);
    if (!result) throw new GeminiError("empty");
    // Gemini can stop early on long audio and still say it finished normally. Never present that as complete.
    const coverage = transcriptCoverage(result.transcript, durationSec);
    if (coverage.partial) result.partial = { transcribedThroughSec: coverage.throughSec };
    await deleteFile(fileName);
    return result;
  }
  throw lastError;
}
