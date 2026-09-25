import { formatTimestamp } from "@/lib/format";
import type { Meeting, SummarySection } from "@/types/meeting";
import { transcriptCoverage } from "./normalize";
import type { ProcessedRecording } from "./types";

const AVATAR_COLORS = ["#7c3aed", "#0891b2", "#db2777", "#ea580c", "#16a34a", "#ca8a04", "#2563eb", "#b91c1c"];
const POSTERS = [
  { from: "#4f46e5", to: "#7c3aed" },
  { from: "#0f766e", to: "#0369a1" },
  { from: "#be185d", to: "#9d174d" },
  { from: "#b45309", to: "#7c2d12" },
  { from: "#4338ca", to: "#0e7490" },
];

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** The gradient a meeting's card and audio player are drawn with, picked from its id so it never changes. */
export const posterFor = (id: string) => POSTERS[hash(id) % POSTERS.length];

export interface UploadMeta {
  id: string;
  shareToken: string;
  createdAt: string; // ISO
  durationSec: number;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  /** Where the recording is stored (Vercel Blob). */
  mediaUrl: string;
}

/**
 * Turns Gemini's result for an uploaded recording into the Meeting shape the
 * detail page renders. Runs on the server, once, when the analysis is saved.
 *
 * Only the General summary exists (one Gemini call), and speakers are
 * "Speaker N" unless a name was said aloud.
 */
export function buildMeeting(p: ProcessedRecording, meta: UploadMeta): Meeting {
  const attendees = p.speakers.map((s, i) => ({
    id: s.id,
    name: s.name,
    avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
  }));

  const general: SummarySection[] = [
    { id: "purpose", title: "Meeting Purpose", kind: "paragraph", body: p.summary.purpose },
    {
      id: "takeaways",
      title: "Key Takeaways",
      kind: "bullets",
      items: p.summary.takeaways.length ? p.summary.takeaways : ["No key takeaways were identified."],
    },
    {
      id: "topics",
      title: "Topics",
      kind: "topics",
      topics: p.summary.topics.length
        ? p.summary.topics
            .map((t) => ({ title: t.title, summary: t.summary, timestamp: Math.min(t.start, meta.durationSec) }))
            .sort((a, b) => a.timestamp - b.timestamp)
        : [{ title: "General discussion", summary: "No distinct topics were identified.", timestamp: 0 }],
    },
    {
      id: "next-steps",
      title: "Next Steps",
      kind: "bullets",
      items: p.summary.nextSteps.length ? p.summary.nextSteps : ["No next steps were identified."],
    },
  ];

  return {
    id: meta.id,
    shareToken: meta.shareToken,
    title: p.title,
    date: meta.createdAt,
    durationSec: meta.durationSec,
    poster: posterFor(meta.id),
    attendees,
    transcript: p.transcript.map((t, i) => ({
      id: `t${String(i + 1).padStart(3, "0")}`,
      speakerId: t.speakerId,
      text: t.text,
      start: t.start,
    })),
    summaries: { general },
    actionItems: p.actionItems.map((a, i) => ({
      id: `a${String(i + 1).padStart(2, "0")}`,
      text: a.text,
      assigneeId: a.assigneeId ?? "", // "" = unassigned; the UI simply omits the assignee
      timestamp: a.start,
      done: false,
    })),
    notice: coverageNotice(
      p.transcript.map((t) => ({ start: t.start, text: t.text })),
      meta.durationSec,
    ),
    media: { url: meta.mediaUrl, fileName: meta.fileName, mimeType: meta.mimeType, sizeBytes: meta.sizeBytes },
  };
}

/**
 * A warning when the transcript seems to end well before the recording does.
 * Worked out from the transcript itself rather than stored, so it is always
 * current: re-checked whenever a meeting is loaded (see lib/meetings.ts).
 */
export function coverageNotice(transcript: { start: number; text: string }[], durationSec: number): string | undefined {
  const { throughSec, partial } = transcriptCoverage(transcript, durationSec);
  if (!partial) return undefined;
  return `This transcript seems to stop at about ${formatTimestamp(throughSec)} of a ${formatTimestamp(durationSec)} recording, so the end of the call may be missing. The summary and action items only cover what was transcribed. Try uploading it again, or a shorter recording.`;
}
