import { formatTimestamp } from "@/lib/format";
import type { Meeting, MeetingListItem, SummarySection } from "@/types/meeting";
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

export interface UploadMeta {
  id: string;
  createdAt: string; // ISO
  durationSec: number;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

/**
 * Turns Gemini's result for an uploaded recording into the same Meeting shape
 * the seeded meetings use, so it opens in the existing detail page.
 *
 * Differences from seeded meetings: only the General summary exists (one Gemini
 * call), there are no highlights (those are user-made), speakers are
 * "Speaker N" unless a name was said aloud, and there is no share link.
 */
export function buildMeeting(p: ProcessedRecording, meta: UploadMeta): Meeting {
  const attendees = p.speakers.map((s, i) => ({
    id: s.id,
    name: s.name,
    email: "",
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
    shareToken: "", // uploads exist only in this browser, so there is nothing to share
    title: p.title,
    date: meta.createdAt,
    durationSec: meta.durationSec,
    platform: "upload",
    poster: POSTERS[hash(meta.id) % POSTERS.length],
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
    highlights: [],
    source: "upload",
    notice: p.partial
      ? `Only the first ${formatTimestamp(p.partial.transcribedThroughSec)} of this ${formatTimestamp(meta.durationSec)} recording was transcribed. Gemini stopped early, which happens with long recordings. The summary and action items only cover that part. Try uploading a shorter recording.`
      : undefined,
    media: { fileName: meta.fileName, mimeType: meta.mimeType, sizeBytes: meta.sizeBytes },
  };
}

/** The lightweight row My Calls needs for an uploaded meeting. */
export function toListItem(m: Meeting): MeetingListItem {
  return {
    id: m.id,
    title: m.title,
    date: m.date,
    durationSec: m.durationSec,
    platform: m.platform,
    source: "upload",
    poster: m.poster,
    attendees: m.attendees,
  };
}
