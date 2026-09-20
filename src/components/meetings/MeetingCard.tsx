import Link from "next/link";
import { AvatarStack } from "@/components/ui/Avatar";
import { CalendarIcon, ClockIcon, PlayIcon } from "@/components/ui/icons";
import { formatDate, formatDuration } from "@/lib/format";
import type { MeetingMatch } from "@/lib/search";

const platformLabel = { zoom: "Zoom", meet: "Google Meet", teams: "Microsoft Teams" } as const;

export function MeetingCard({ match }: { match: MeetingMatch }) {
  const { meeting, matchedAttendees } = match;

  return (
    <Link
      href={`/meetings/${meeting.id}`}
      className="group flex w-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 dark:border-zinc-800 dark:bg-zinc-900"
    >
      {/* Static poster. Recording and playback are out of scope (stubbed), so
          this is a generated gradient rather than a real video frame. */}
      <div
        className="relative flex h-32 items-center justify-center"
        style={{ backgroundImage: `linear-gradient(135deg, ${meeting.poster.from}, ${meeting.poster.to})` }}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow transition group-hover:scale-105">
          <PlayIcon className="ml-0.5 h-5 w-5" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h2 className="line-clamp-2 text-base font-semibold leading-snug">{meeting.title}</h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {platformLabel[meeting.platform]}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <CalendarIcon className="h-4 w-4" />
            {formatDate(meeting.date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon className="h-4 w-4" />
            {formatDuration(meeting.durationSec)}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <AvatarStack attendees={meeting.attendees} />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {meeting.attendees.length} attendees
          </span>
        </div>

        {matchedAttendees.length > 0 && (
          <p className="rounded-md bg-violet-50 px-2 py-1 text-xs text-violet-800 dark:bg-violet-950 dark:text-violet-200">
            Attendee match: {matchedAttendees.map((a) => a.name).join(", ")}
          </p>
        )}
      </div>
    </Link>
  );
}
