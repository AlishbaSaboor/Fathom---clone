/**
 * Data model for the Fathom clone.
 *
 * All timestamps are whole seconds from the start of the meeting. They are
 * formatted for display in `lib/format.ts`, never stored as strings, so the
 * transcript, highlights, action items and summary topics can all deep-link
 * to the same position.
 */

export type TemplateId = "general" | "sales" | "standup";

export interface Attendee {
  id: string;
  name: string;
  email: string;
  /** Job title. Filled in for the large call, optional elsewhere. */
  role?: string;
  /** Hex color used for the avatar and the speaker label in the transcript. */
  avatarColor: string;
  isHost?: boolean;
}

export interface TranscriptSegment {
  id: string;
  /** References Attendee.id so names and colors stay in one place. */
  speakerId: string;
  text: string;
  /** Seconds from meeting start. */
  start: number;
}

export interface Highlight {
  id: string;
  timestamp: number;
  note: string;
  createdById: string;
}

export interface ActionItem {
  id: string;
  text: string;
  /** References Attendee.id. */
  assigneeId: string;
  /** Where in the call the item was raised. */
  timestamp: number;
  /** Seed value only. The UI toggles this in client state, nothing is persisted. */
  done: boolean;
  // The fields below are mostly used by the large call. UI must render
  // correctly when they are absent (flat list) and when present (grouped).
  /** Workstream heading, e.g. "Engineering". When any item has one, the list renders grouped. */
  group?: string;
  /** ISO date (YYYY-MM-DD). */
  dueDate?: string;
  priority?: "high" | "normal";
}

/** Agenda-style chapter markers. Only long calls have these. */
export interface Chapter {
  id: string;
  title: string;
  start: number;
}

export interface SummaryTopic {
  title: string;
  summary: string;
  timestamp: number;
}

/**
 * A summary is an ordered list of sections. Each template stores its own list,
 * so switching templates changes the structure, not just the labels.
 */
export type SummarySection =
  | { id: string; title: string; kind: "paragraph"; body: string }
  | { id: string; title: string; kind: "bullets"; items: string[] }
  | { id: string; title: string; kind: "topics"; topics: SummaryTopic[] }
  | {
      id: string;
      title: string;
      kind: "byPerson";
      entries: { attendeeId: string; items: string[] }[];
    };

export type Platform = "zoom" | "meet" | "teams";

export interface Meeting {
  id: string;
  /**
   * Opaque token used by /share/[token]. Deliberately not the meeting id, so a
   * share link does not expose or reveal internal ids.
   * Revocation and expiry are out of scope (stubbed): a token is valid forever.
   */
  shareToken: string;
  title: string;
  /** ISO 8601 timestamp of the meeting start. */
  date: string;
  durationSec: number;
  /** Display only. Capture and recording are out of scope (stubbed). */
  platform: Platform;
  /** Gradient colors for the generated poster shown in place of real video. */
  poster: { from: string; to: string };
  attendees: Attendee[];
  transcript: TranscriptSegment[];
  /**
   * One stored summary per template. `general` must contain the four core
   * sections (purpose, takeaways, topics, next-steps); see lib/validate.ts.
   */
  summaries: Record<TemplateId, SummarySection[]>;
  actionItems: ActionItem[];
  /** At least one per meeting. */
  highlights: Highlight[];
  chapters?: Chapter[];
}

/** What the My Calls list needs. Keeps transcripts out of the client bundle. */
export type MeetingListItem = Pick<
  Meeting,
  "id" | "title" | "date" | "durationSec" | "platform" | "poster" | "attendees"
>;
