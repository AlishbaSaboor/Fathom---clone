import { formatDuration } from "@/lib/format";
import type { Meeting, SummarySection } from "@/types/meeting";

// A "digest" is a compact text version of one call for the account-level Ask
// Fathom chat: who was there, what was decided, and every action item with its
// owner and due date. It is built from the summary, never the transcript, so
// dozens of calls fit in one prompt. Shared by the server (which digests the
// built-in calls itself) and the browser (which digests the user's uploads,
// since those only exist in their browser and are sent with the question).

/** Room for one call's digest. Action items come first so they survive truncation. */
export const MAX_DIGEST_CHARS = 8_000;
/** Everything sent to the model for one question, all calls together. */
export const MAX_CONTEXT_CHARS = 60_000;
/** Most uploaded calls included; the newest win. */
export const MAX_UPLOADED_CALLS = 20;

/**
 * Digest text is untrusted: an upload's summary is model output about a
 * recording, and a hostile recording could say anything. The prompt wraps digests
 * in tags and tells the model to treat them as data, so nothing inside may be
 * able to close or forge a tag. Stripping angle brackets, quotes and control
 * characters removes that possibility.
 */
export function clean(text: string): string {
  return text
    .replace(/[<>"\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionText(section: SummarySection, nameOf: (id: string) => string): string {
  const title = clean(section.title);
  switch (section.kind) {
    case "paragraph":
      return `${title}: ${clean(section.body)}`;
    case "bullets":
      return `${title}: ${section.items.map(clean).join("; ")}`;
    case "topics":
      return `${title}: ${section.topics.map((t) => `${clean(t.title)} (${clean(t.summary)})`).join("; ")}`;
    case "byPerson":
      return `${title}: ${section.entries.map((e) => `${nameOf(e.attendeeId)}: ${e.items.map(clean).join("; ")}`).join(" | ")}`;
  }
}

/** One call as digest text: header line, action items, then the summary, cut off at `max` characters. */
export function buildDigest(meeting: Meeting, max = MAX_DIGEST_CHARS): string {
  const nameOf = (id: string) => clean(meeting.attendees.find((a) => a.id === id)?.name ?? "Unknown");
  const lines: string[] = [
    `Date: ${meeting.date.slice(0, 10)}. Length: ${formatDuration(meeting.durationSec)}. Attendees: ${
      meeting.attendees.map((a) => clean(a.name)).join(", ") || "unknown"
    }.`,
  ];

  if (meeting.actionItems.length > 0) {
    lines.push("Action items:");
    for (const item of meeting.actionItems) {
      const bits = [
        item.done ? "done" : "open",
        nameOf(item.assigneeId),
        item.dueDate ? `due ${item.dueDate}` : "no due date",
        item.priority === "high" ? "high priority" : "",
        item.group ? `workstream ${clean(item.group)}` : "",
      ].filter(Boolean);
      lines.push(`- ${clean(item.text)} (${bits.join(", ")})`);
    }
  } else {
    lines.push("Action items: none.");
  }

  lines.push(...meeting.summaries.general.map((s) => sectionText(s, nameOf)));
  if (meeting.chapters?.length) lines.push(`Chapters: ${meeting.chapters.map((c) => clean(c.title)).join("; ")}`);

  const text = lines.join("\n");
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
