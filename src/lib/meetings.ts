import { meetings } from "@/data/meetings";
import type { Meeting, MeetingListItem } from "@/types/meeting";

// The only module that reads from src/data. Everything is async on purpose:
// swapping the static seed data for a real database later means changing this
// file and nothing that calls it. There is no database and no auth (out of
// scope for this build), so every function here is public read-only access.

const newestFirst = (a: Meeting, b: Meeting) => b.date.localeCompare(a.date);

/** Lightweight rows for My Calls; transcripts and summaries are left out. */
export async function getMeetingList(): Promise<MeetingListItem[]> {
  return [...meetings].sort(newestFirst).map((m) => ({
    id: m.id,
    title: m.title,
    date: m.date,
    durationSec: m.durationSec,
    platform: m.platform,
    source: m.source ?? "seed",
    poster: m.poster,
    attendees: m.attendees,
  }));
}

export async function getMeetingById(id: string): Promise<Meeting | undefined> {
  return meetings.find((m) => m.id === id);
}

/** Resolves a public share link. No auth: possession of the token is the access check. */
export async function getMeetingByShareToken(token: string): Promise<Meeting | undefined> {
  return meetings.find((m) => m.shareToken === token);
}

export async function getAllMeetingIds(): Promise<string[]> {
  return meetings.map((m) => m.id);
}

export async function getAllShareTokens(): Promise<string[]> {
  return meetings.map((m) => m.shareToken);
}
