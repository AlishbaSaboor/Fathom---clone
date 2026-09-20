"use client";

import Link from "next/link";
import { AvatarStack } from "@/components/ui/Avatar";
import { CalendarIcon, ClockIcon, PlayIcon, TrashIcon } from "@/components/ui/icons";
import { formatDate, formatDuration } from "@/lib/format";
import { deleteUpload } from "@/lib/recordings/storage";
import type { MeetingMatch } from "@/lib/search";

const platformLabel = { zoom: "Zoom", meet: "Google Meet", teams: "Microsoft Teams", upload: "Uploaded recording" } as const;

export function MeetingCard({ match }: { match: MeetingMatch }) {
  const { meeting, matchedAttendees } = match;
  const uploaded = meeting.source === "upload";
  // Uploaded meetings live in this browser only, so they open on their own route.
  const href = uploaded ? `/uploads/${meeting.id}` : `/meetings/${meeting.id}`;

  function remove() {
    if (window.confirm(`Delete "${meeting.title}"? The recording and its transcript are removed from this browser and can't be recovered.`)) {
      void deleteUpload(meeting.id);
    }
  }

  return (
    <div className="group relative flex w-full">
      <Link
        href={href}
        className="flex w-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 dark:border-zinc-800 dark:bg-zinc-900"
      >
        {/* Seeded meetings: a static generated poster, since recording and
            playback are out of scope for them (stubbed). Uploaded meetings have
            a real player on their detail page. */}
        <div
          className="relative flex h-32 items-center justify-center"
          style={{ backgroundImage: `linear-gradient(135deg, ${meeting.poster.from}, ${meeting.poster.to})` }}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow transition group-hover:scale-105">
            <PlayIcon className="ml-0.5 h-5 w-5" />
          </span>
          {uploaded && (
            <span className="absolute left-2 top-2 rounded bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">
              Uploaded
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div>
            <h2 className="line-clamp-2 text-base font-semibold leading-snug">{meeting.title}</h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{platformLabel[meeting.platform]}</p>
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
              {meeting.attendees.length} {meeting.attendees.length === 1 ? "attendee" : "attendees"}
            </span>
          </div>

          {matchedAttendees.length > 0 && (
            <p className="rounded-md bg-violet-50 px-2 py-1 text-xs text-violet-800 dark:bg-violet-950 dark:text-violet-200">
              Attendee match: {matchedAttendees.map((a) => a.name).join(", ")}
            </p>
          )}
        </div>
      </Link>

      {/* A sibling of the link, not inside it: a button can't be nested in an anchor. */}
      {uploaded && (
        <button
          type="button"
          onClick={remove}
          aria-label={`Delete ${meeting.title}`}
          className="absolute right-2 top-2 rounded-md bg-black/55 p-1.5 text-white opacity-0 transition hover:bg-rose-600 focus-visible:opacity-100 group-hover:opacity-100 max-md:opacity-100"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
