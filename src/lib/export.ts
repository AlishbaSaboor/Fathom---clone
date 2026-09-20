import { groupActionItems } from "@/lib/actionItems";
import { formatDueDate, formatTimestamp } from "@/lib/format";
import type { ActionItem, Attendee, Meeting, SummarySection } from "@/types/meeting";

// Plain-text serializers behind the "Copy Summary", "Copy Transcript" and
// action item copy buttons.

const nameOf = (attendees: Attendee[], id: string) =>
  attendees.find((a) => a.id === id)?.name ?? "Unknown";

export function summaryToText(sections: SummarySection[], attendees: Attendee[]): string {
  return sections
    .map((s) => {
      switch (s.kind) {
        case "paragraph":
          return `${s.title}\n${s.body}`;
        case "bullets":
          return `${s.title}\n${s.items.map((i) => `- ${i}`).join("\n")}`;
        case "topics":
          return `${s.title}\n${s.topics
            .map((t) => `- ${t.title} (${formatTimestamp(t.timestamp)}): ${t.summary}`)
            .join("\n")}`;
        case "byPerson":
          return `${s.title}\n${s.entries
            .map((e) => `${nameOf(attendees, e.attendeeId)}:\n${e.items.map((i) => `  - ${i}`).join("\n")}`)
            .join("\n")}`;
      }
    })
    .join("\n\n");
}

export function transcriptToText(meeting: Meeting): string {
  return meeting.transcript
    .map((s) => `[${formatTimestamp(s.start)}] ${nameOf(meeting.attendees, s.speakerId)}: ${s.text}`)
    .join("\n");
}

export function actionItemsToText(
  items: ActionItem[],
  done: Record<string, boolean>,
  attendees: Attendee[],
): string {
  const line = (a: ActionItem) => {
    const due = a.dueDate ? `, due ${formatDueDate(a.dueDate)}` : "";
    return `[${done[a.id] ? "x" : " "}] ${a.text} (${nameOf(attendees, a.assigneeId)}${due})`;
  };
  return groupActionItems(items)
    .map((g) => {
      const lines = g.items.map(line).join("\n");
      return g.name ? `${g.name}\n${lines}` : lines;
    })
    .join("\n\n");
}
