import type { ProcessedRecording } from "./types";

/** "1:02:03" | "02:03" | "2:03" | "123" | 123 -> seconds, or null if unparseable. */
export function parseTimestamp(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.round(value));
  if (typeof value !== "string") return null;
  const cleaned = value.trim().replace(/[\[\]()]/g, "");
  if (!cleaned) return null;
  const parts = cleaned.split(":");
  if (parts.length > 3 || parts.some((p) => !/^\d+(\.\d+)?$/.test(p))) return null;
  const nums = parts.map(Number);
  const seconds = nums.reduce((total, n) => total * 60 + n, 0);
  return Math.max(0, Math.round(seconds));
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const strList = (v: unknown) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);

/**
 * Turns Gemini's raw JSON into a clean, safe ProcessedRecording. The model is
 * constrained to a schema but is still untrusted input: this drops empty
 * entries, fixes speaker ids that do not exist, parses M:SS timestamps, clamps
 * them into the recording's length and sorts the transcript.
 *
 * Returns null when there is no usable transcript (silent audio, no speech).
 */
export function normalizeAnalysis(raw: unknown, durationSec: number, model: string): ProcessedRecording | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const clamp = (t: number) => Math.min(Math.max(0, t), Math.max(durationSec, 0));

  // speakers
  const speakers: { id: string; name: string }[] = [];
  const seen = new Set<string>();
  if (Array.isArray(r.speakers)) {
    for (const s of r.speakers) {
      const o = (s ?? {}) as Record<string, unknown>;
      const id = str(o.id);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      speakers.push({ id, name: str(o.name) || `Speaker ${speakers.length + 1}` });
    }
  }
  const ensureSpeaker = (id: string): string => {
    if (seen.has(id)) return id;
    seen.add(id);
    speakers.push({ id, name: `Speaker ${speakers.length + 1}` });
    return id;
  };

  // transcript
  const transcript: ProcessedRecording["transcript"] = [];
  if (Array.isArray(r.transcript)) {
    for (const seg of r.transcript) {
      const o = (seg ?? {}) as Record<string, unknown>;
      const text = str(o.text);
      if (!text) continue;
      const start = parseTimestamp(o.start);
      const last = transcript[transcript.length - 1];
      transcript.push({
        speakerId: ensureSpeaker(str(o.speaker) || speakers[0]?.id || "speaker-1"),
        start: clamp(start ?? last?.start ?? 0),
        text,
      });
    }
  }
  if (transcript.length === 0) return null;
  transcript.sort((a, b) => a.start - b.start);
  if (speakers.length === 0) speakers.push({ id: transcript[0].speakerId, name: "Speaker 1" });

  // summary
  const s = (r.summary ?? {}) as Record<string, unknown>;
  const topics: ProcessedRecording["summary"]["topics"] = [];
  if (Array.isArray(s.topics)) {
    for (const t of s.topics) {
      const o = (t ?? {}) as Record<string, unknown>;
      const title = str(o.title);
      if (!title) continue;
      topics.push({ title, summary: str(o.summary), start: clamp(parseTimestamp(o.start) ?? 0) });
    }
  }

  // action items
  const actionItems: ProcessedRecording["actionItems"] = [];
  if (Array.isArray(r.actionItems)) {
    for (const a of r.actionItems) {
      const o = (a ?? {}) as Record<string, unknown>;
      const text = str(o.text);
      if (!text) continue;
      const assignee = str(o.assignee);
      actionItems.push({
        text,
        assigneeId: assignee && seen.has(assignee) ? assignee : null,
        start: clamp(parseTimestamp(o.start) ?? 0),
      });
    }
  }

  return {
    title: str(r.title) || "Uploaded recording",
    speakers,
    transcript,
    summary: {
      purpose: str(s.purpose) || "No clear purpose was identified in this recording.",
      takeaways: strList(s.takeaways),
      topics,
      nextSteps: strList(s.nextSteps),
    },
    actionItems,
    model,
  };
}

/**
 * Does the transcript reach the end of the recording? Gemini can stop early on
 * long audio and still report a normal finish, so compare where the last
 * segment starts with the recording's length. A gap of more than 15% (and at
 * least 90 seconds) counts as cut off; a shorter tail is usually just silence
 * or closing chatter.
 */
export function transcriptCoverage(
  transcript: { start: number }[],
  durationSec: number,
): { throughSec: number; partial: boolean } {
  const throughSec = transcript.reduce((max, s) => Math.max(max, s.start), 0);
  const gap = durationSec - throughSec;
  return { throughSec, partial: gap > Math.max(90, durationSec * 0.15) };
}
