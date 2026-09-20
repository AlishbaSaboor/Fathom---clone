import type { Attendee, MeetingListItem } from "@/types/meeting";

export interface MeetingMatch {
  meeting: MeetingListItem;
  /** Attendees that matched the query when the title alone did not. Used to explain the hit. */
  matchedAttendees: Attendee[];
}

const norm = (s: string) => s.toLowerCase();

/**
 * Filters meetings by title or attendee (name or email). Every whitespace
 * separated term must match somewhere in the title or the attendee list, so
 * "dana northgate" finds Dana's call with Northgate.
 */
export function searchMeetings(meetings: MeetingListItem[], query: string): MeetingMatch[] {
  const terms = norm(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return meetings.map((meeting) => ({ meeting, matchedAttendees: [] }));

  const results: MeetingMatch[] = [];
  for (const meeting of meetings) {
    const title = norm(meeting.title);
    const people = meeting.attendees.map((a) => ({ a, text: norm(`${a.name} ${a.email}`) }));

    const matches = terms.every(
      (t) => title.includes(t) || people.some((p) => p.text.includes(t)),
    );
    if (!matches) continue;

    // Only credit attendees for terms the title does not already explain, so
    // "dana northgate" points at Dana and not everyone with a northgate email.
    const uncovered = terms.filter((t) => !title.includes(t));
    const matchedAttendees =
      uncovered.length === 0
        ? []
        : people.filter((p) => uncovered.some((t) => p.text.includes(t))).map((p) => p.a);

    results.push({ meeting, matchedAttendees });
  }
  return results;
}
