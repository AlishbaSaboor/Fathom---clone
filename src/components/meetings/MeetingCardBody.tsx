import { AvatarStack } from "@/components/ui/Avatar";
import { PlayIcon } from "@/components/ui/icons";
import { formatDateTime, formatDuration } from "@/lib/format";
import type { Attendee, MeetingListItem } from "@/types/meeting";
import { VideoThumbnail } from "./VideoThumbnail";

export function MeetingCardBody({
  meeting,
  matchedAttendees = [],
}: {
  meeting: MeetingListItem;
  matchedAttendees?: Attendee[];
}) {
  const isVideo = meeting.media?.mimeType?.startsWith("video/") && Boolean(meeting.media?.url);

  return (
    <>
      <div className="relative flex aspect-video min-h-[180px] w-full items-center justify-center overflow-hidden bg-black/90">
        <VideoThumbnail
          url={isVideo ? meeting.media?.url : undefined}
          poster={meeting.poster}
        />
        <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#201D1A] shadow-md transition group-hover:scale-110">
          <PlayIcon className="ml-0.5 h-5 w-5" />
        </span>
        <span className="absolute bottom-2.5 right-2.5 z-10 rounded-md bg-black/75 px-1.5 py-0.5 font-mono text-[11px] font-medium text-white backdrop-blur-xs">
          {formatDuration(meeting.durationSec)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h2 className="line-clamp-2 text-base font-bold leading-snug text-[#201D1A] dark:text-[#F3F4F6]">{meeting.title}</h2>
          <p className="mt-1 text-xs text-[#201D1A]/60 dark:text-[#F3F4F6]/60">{formatDateTime(meeting.date)}</p>
        </div>

        {matchedAttendees.length > 0 && (
          <p className="rounded-md bg-[#0F6E56]/10 px-2 py-1 text-xs text-[#0F6E56] dark:bg-[#3EC79A]/15 dark:text-[#3EC79A]">
            Attendee match: {matchedAttendees.map((a) => a.name).join(", ")}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#201D1A]/8 pt-3 dark:border-white/10">
          <AvatarStack attendees={meeting.attendees} ringClassName="ring-white dark:ring-[#111827]" />
          <span className="text-xs text-[#201D1A]/60 dark:text-[#F3F4F6]/60">
            {meeting.actionItemCount} {meeting.actionItemCount === 1 ? "action item" : "action items"}
          </span>
        </div>
      </div>
    </>
  );
}
