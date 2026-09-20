import type { Meeting } from "@/types/meeting";

/**
 * The version of a meeting that is safe to send to a logged-out viewer.
 *
 * Hiding a field in the UI is not enough on a public page: props passed to a
 * client component are serialized into the page source, so anyone can read
 * them with view-source. This removes the private fields on the server, before
 * the props are built.
 *
 *  - attendee emails are blanked (names and roles are shown in the UI)
 *  - highlight notes are blanked (they are internal-team annotations; the
 *    highlighted moment itself stays marked in the transcript)
 *
 * The summary, transcript and action items are exactly what the share page
 * displays, so they are passed through unchanged.
 */
export function toPublicMeeting(meeting: Meeting): Meeting {
  return {
    ...meeting,
    attendees: meeting.attendees.map((a) => ({ ...a, email: "" })),
    highlights: meeting.highlights.map((h) => ({ ...h, note: "" })),
  };
}
