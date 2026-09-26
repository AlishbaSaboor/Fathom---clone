"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SearchIcon, UploadIcon, XIcon } from "@/components/ui/icons";
import { searchMeetings, type MeetingMatch } from "@/lib/search";
import type { MeetingListItem, PlaylistSummary } from "@/types/meeting";
import { MeetingCard } from "./MeetingCard";

/** `narrow`: a side panel takes the right of the page, so the cards drop from three columns to two. */
export function MeetingGrid({
  meetings,
  playlists,
  narrow = false,
}: {
  meetings: MeetingListItem[];
  playlists: PlaylistSummary[];
  narrow?: boolean;
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchMeetings(meetings, query), [meetings, query]);
  const searching = query.trim().length > 0;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 basis-64 sm:max-w-xl">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2B241C]/40 dark:text-[#F2EDDD]/40" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or attendee"
            aria-label="Search calls by title or attendee"
            className="w-full rounded-lg border border-[#2B241C]/20 bg-white py-2.5 pl-10 pr-10 text-sm shadow-sm outline-none placeholder:text-[#2B241C]/40 focus:border-[#0F6E56] focus:ring-2 focus:ring-[#0F6E56]/25 dark:border-[#F2EDDD]/20 dark:bg-[#101B33] dark:placeholder:text-[#F2EDDD]/40 dark:focus:border-[#3EC79A] dark:focus:ring-[#3EC79A]/25 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#2B241C]/40 hover:text-[#2B241C] dark:text-[#F2EDDD]/40 dark:hover:text-[#F2EDDD]"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <Link
          href="/upload"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#0F6E56] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:bg-[#3EC79A] dark:text-[#101B33] dark:focus-visible:outline-[#3EC79A]"
        >
          <UploadIcon className="h-4 w-4" />
          Upload a recording
        </Link>
      </div>

      <p className="mt-3 text-sm text-[#2B241C]/60 dark:text-[#F2EDDD]/60" aria-live="polite">
        {searching
          ? `${results.length} of ${meetings.length} calls`
          : `${meetings.length} ${meetings.length === 1 ? "call" : "calls"}`}
      </p>

      {meetings.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[#2B241C]/25 p-10 text-center dark:border-[#F2EDDD]/25">
          <p className="font-medium">No calls yet</p>
          <p className="mt-1 text-sm text-[#2B241C]/60 dark:text-[#F2EDDD]/60">
            Upload a recording to get a transcript, summary and action items.
          </p>
          <Link
            href="/upload"
            className="mt-4 inline-block rounded-md bg-[#0F6E56] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 dark:bg-[#3EC79A] dark:text-[#101B33]"
          >
            Upload a recording
          </Link>
        </div>
      ) : results.length > 0 ? (
        <div className="mt-6">
          <CardList matches={results} playlists={playlists} narrow={narrow} />
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-[#2B241C]/25 p-10 text-center dark:border-[#F2EDDD]/25">
          <p className="font-medium">No calls match &ldquo;{query.trim()}&rdquo;</p>
          <p className="mt-1 text-sm text-[#2B241C]/60 dark:text-[#F2EDDD]/60">
            Try a different title or an attendee&rsquo;s name.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-4 rounded-md bg-[#0F6E56] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 dark:bg-[#3EC79A] dark:text-[#101B33]"
          >
            Clear search
          </button>
        </div>
      )}
    </>
  );
}

function CardList({ matches, playlists, narrow }: { matches: MeetingMatch[]; playlists: PlaylistSummary[]; narrow: boolean }) {
  return (
    <ul className={`grid gap-5 sm:grid-cols-2 ${narrow ? "2xl:grid-cols-3" : "lg:grid-cols-3"}`}>
      {matches.map((match) => (
        <li key={match.meeting.id} className="flex">
          <MeetingCard match={match} playlists={playlists} />
        </li>
      ))}
    </ul>
  );
}
