import type { Meeting } from "@/types/meeting";

/**
 * The version of a meeting that is safe to send to a logged-out viewer.
 *
 * Hiding a field in the UI is not enough on a public page: props passed to a
 * client component are serialized into the page source, so anyone can read
 * them with view-source. This removes the private fields on the server, before
 * the props are built.
 *
 *  - the meeting id is replaced (the owner's own URLs use it) and the original
 *    file name is dropped; the player only needs the stored file's URL and type
 *
 * The summary, transcript and action items are exactly what the share page
 * displays, so they are passed through unchanged.
 */
export function toPublicMeeting(meeting: Meeting): Meeting {
  return {
    ...meeting,
    id: `shared-${meeting.shareToken}`,
    media: meeting.media && { ...meeting.media, fileName: "" },
  };
}
