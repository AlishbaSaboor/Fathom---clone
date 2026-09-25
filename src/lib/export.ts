import { formatTimestamp } from "@/lib/format";
import type { Attendee, Meeting, SummarySection } from "@/types/meeting";

// Plain-text serializers behind the "Copy Summary" and "Copy Transcript" buttons.

const nameOf = (attendees: Attendee[], id: string) =>
  attendees.find((a) => a.id === id)?.name ?? "Unknown";

export function summaryToText(sections: SummarySection[]): string {
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
      }
    })
    .join("\n\n");
}

export function transcriptToText(meeting: Meeting): string {
  return meeting.transcript
    .map((s) => `[${formatTimestamp(s.start)}] ${nameOf(meeting.attendees, s.speakerId)}: ${s.text}`)
    .join("\n");
}
