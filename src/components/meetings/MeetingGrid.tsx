"use client";

import { useMemo, useState } from "react";
import { SearchIcon, XIcon } from "@/components/ui/icons";
import { searchMeetings } from "@/lib/search";
import type { MeetingListItem } from "@/types/meeting";
import { MeetingCard } from "./MeetingCard";

export function MeetingGrid({ meetings }: { meetings: MeetingListItem[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchMeetings(meetings, query), [meetings, query]);
  const searching = query.trim().length > 0;

  return (
    <>
      <div className="relative max-w-xl">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or attendee"
          aria-label="Search calls by title or attendee"
          className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-10 text-sm shadow-sm outline-none placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 dark:border-zinc-700 dark:bg-zinc-900 [&::-webkit-search-cancel-button]:hidden"
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

      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400" aria-live="polite">
        {searching
          ? `${results.length} of ${meetings.length} calls`
          : `${meetings.length} calls`}
      </p>

      {results.length > 0 ? (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((match) => (
            <li key={match.meeting.id} className="flex">
              <MeetingCard match={match} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="font-medium">No calls match &ldquo;{query.trim()}&rdquo;</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Try a different title or an attendee&rsquo;s name.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-4 rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
          >
            Clear search
          </button>
        </div>
      )}
    </>
  );
}
