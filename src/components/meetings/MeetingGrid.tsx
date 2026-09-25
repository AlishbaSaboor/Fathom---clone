"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SearchIcon, UploadIcon, XIcon } from "@/components/ui/icons";
import { searchMeetings, type MeetingMatch } from "@/lib/search";
import type { MeetingListItem } from "@/types/meeting";
import { MeetingCard } from "./MeetingCard";

/** `narrow`: a side panel takes the right of the page, so the cards drop from three columns to two. */
export function MeetingGrid({ meetings, narrow = false }: { meetings: MeetingListItem[]; narrow?: boolean }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchMeetings(meetings, query), [meetings, query]);
  const searching = query.trim().length > 0;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 basis-64 sm:max-w-xl">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or attendee"
            aria-label="Search calls by title or attendee"
            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-10 text-sm shadow-sm outline-none placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-900 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <Link
          href="/upload"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <UploadIcon className="h-4 w-4" />
          Upload a recording
        </Link>
      </div>

      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400" aria-live="polite">
        {searching
          ? `${results.length} of ${meetings.length} calls`
          : `${meetings.length} ${meetings.length === 1 ? "call" : "calls"}`}
      </p>

      {meetings.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="font-medium">No calls yet</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Upload a recording to get a transcript, summary and action items.
          </p>
          <Link href="/upload" className="mt-4 inline-block rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
            Upload a recording
          </Link>
        </div>
      ) : results.length > 0 ? (
        <div className="mt-6">
          <CardList matches={results} narrow={narrow} />
        </div>
      ) : (
        <div className="mt-10 rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="font-medium">No calls match &ldquo;{query.trim()}&rdquo;</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Try a different title or an attendee&rsquo;s name.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-4 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Clear search
          </button>
        </div>
      )}
    </>
  );
}

function CardList({ matches, narrow }: { matches: MeetingMatch[]; narrow: boolean }) {
  return (
    <ul className={`grid gap-5 sm:grid-cols-2 ${narrow ? "2xl:grid-cols-3" : "lg:grid-cols-3"}`}>
      {matches.map((match) => (
        <li key={match.meeting.id} className="flex">
          <MeetingCard match={match} />
        </li>
      ))}
    </ul>
  );
}
