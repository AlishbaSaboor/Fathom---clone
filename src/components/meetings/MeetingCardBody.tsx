import { AvatarStack } from "@/components/ui/Avatar";
import { PlayIcon } from "@/components/ui/icons";
import { formatDateTime, formatDuration } from "@/lib/format";
import type { Attendee, MeetingListItem } from "@/types/meeting";

/**
 * The visual body of a meeting tile — poster, title, date, attendee row —
 * with no actions of its own. Shared by MeetingCard (My Calls, wraps it in a
 * link to /meetings/[id] plus an owner action menu), PlaylistMeetingCard
 * (wraps it in the same link plus a "remove from playlist" menu), and the
 * public playlist page (wraps it in a link to the meeting's own /share/[token]
 * page, no actions at all).
 */
export function MeetingCardBody({
  meeting,
  matchedAttendees = [],
}: {
  meeting: MeetingListItem;
  matchedAttendees?: Attendee[];
}) {
  return (
    <>
      <div
        className="relative flex h-32 items-center justify-center"
        style={{ backgroundImage: `linear-gradient(135deg, ${meeting.poster.from}, ${meeting.poster.to})` }}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#2B241C] shadow transition group-hover:scale-105">
          <PlayIcon className="ml-0.5 h-5 w-5" />
        </span>
        <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
          {formatDuration(meeting.durationSec)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h2 className="line-clamp-2 text-base font-semibold leading-snug">{meeting.title}</h2>
          <p className="mt-1 text-sm text-[#2B241C]/60 dark:text-[#F2EDDD]/60">{formatDateTime(meeting.date)}</p>
        </div>

        {matchedAttendees.length > 0 && (
          <p className="rounded-md bg-[#0F6E56]/10 px-2 py-1 text-xs text-[#0F6E56] dark:bg-[#3EC79A]/15 dark:text-[#3EC79A]">
            Attendee match: {matchedAttendees.map((a) => a.name).join(", ")}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#2B241C]/10 pt-3 dark:border-[#F2EDDD]/10">
          <AvatarStack attendees={meeting.attendees} ringClassName="ring-white dark:ring-[#101B33]" />
          <span className="text-xs text-[#2B241C]/60 dark:text-[#F2EDDD]/60">
            {meeting.actionItemCount} {meeting.actionItemCount === 1 ? "action item" : "action items"}
          </span>
        </div>
      </div>
    </>
  );
}
