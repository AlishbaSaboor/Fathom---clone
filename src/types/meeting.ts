/**
 * Data model for the app.
 *
 * All timestamps are whole seconds from the start of the meeting. They are
 * formatted for display in `lib/format.ts`, never stored as strings, so the
 * transcript, action items and summary topics can all deep-link to the same
 * position in the recording.
 */

export interface Attendee {
  id: string;
  /** "Speaker N" unless a name was said aloud in the recording. */
  name: string;
  /** Hex color used for the avatar and the speaker label in the transcript. */
  avatarColor: string;
}

export interface TranscriptSegment {
  id: string;
  /** References Attendee.id so names and colors stay in one place. */
  speakerId: string;
  text: string;
  /** Seconds from meeting start. */
  start: number;
}

export interface ActionItem {
  id: string;
  text: string;
  /** References Attendee.id; "" when Gemini could not tell who it was for. */
  assigneeId: string;
  /** Where in the call the item was raised. */
  timestamp: number;
  /** Saved: the owner's checkbox. */
  done: boolean;
}

export interface SummaryTopic {
  title: string;
  summary: string;
  timestamp: number;
}

/** A summary is an ordered list of sections, each rendered by its kind. */
export type SummarySection =
  | { id: string; title: string; kind: "paragraph"; body: string }
  | { id: string; title: string; kind: "bullets"; items: string[] }
  | { id: string; title: string; kind: "topics"; topics: SummaryTopic[] };

/** The stored summary. One Gemini call produces the General summary. */
export interface SummarySet {
  general: SummarySection[];
}

export interface Meeting {
  id: string;
  /**
   * Opaque token used by /share/[token]. Deliberately not the meeting id, so a
   * share link does not expose or reveal internal ids. The link works until the
   * owner deletes the recording.
   */
  shareToken: string;
  title: string;
  /** ISO 8601 timestamp of when the recording was uploaded. */
  date: string;
  durationSec: number;
  /** Gradient colors for the card and the audio player, picked from the id. */
  poster: { from: string; to: string };
  attendees: Attendee[];
  transcript: TranscriptSegment[];
  summaries: SummarySet;
  actionItems: ActionItem[];
  /** A note shown above the tabs, e.g. that a recording was only partly transcribed. */
  notice?: string;
  /** The stored recording: `url` is its address in Vercel Blob, which is what the player and Download use. */
  media?: { url: string; fileName: string; mimeType: string; sizeBytes: number };
}

/** What the My Calls list needs. Keeps transcripts out of the client bundle. */
export type MeetingListItem = Pick<
  Meeting,
  "id" | "title" | "date" | "durationSec" | "poster" | "attendees" | "shareToken"
>;
