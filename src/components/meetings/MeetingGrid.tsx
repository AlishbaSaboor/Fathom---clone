"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SearchIcon, SparkleIcon, UploadIcon, XIcon } from "@/components/ui/icons";
import { searchMeetings, type MeetingMatch } from "@/lib/search";
import type { MeetingListItem, PlaylistSummary } from "@/types/meeting";
import { MeetingCard } from "./MeetingCard";

export function MeetingGrid({
  meetings,
  playlists,
  narrow = false,
  onOpenAskAll,
}: {
  meetings: MeetingListItem[];
  playlists: PlaylistSummary[];
  narrow?: boolean;
  onOpenAskAll?: () => void;
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchMeetings(meetings, query), [meetings, query]);
  const searching = query.trim().length > 0;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 basis-64 sm:max-w-xl">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#201D1A]/40 dark:text-[#F3F4F6]/40" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or attendee"
            aria-label="Search calls by title or attendee"
            className="w-full rounded-xl border border-[#201D1A]/10 bg-white py-2.5 pl-10 pr-10 text-sm shadow-2xs outline-none placeholder:text-[#201D1A]/40 focus:border-[#0F6E56] focus:ring-2 focus:ring-[#0F6E56]/20 dark:border-white/10 dark:bg-white/[0.04] dark:placeholder:text-[#F3F4F6]/40 dark:focus:border-[#3EC79A] dark:focus:ring-[#3EC79A]/20 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#201D1A]/40 hover:text-[#201D1A] dark:text-[#F3F4F6]/40 dark:hover:text-[#F3F4F6]"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {onOpenAskAll && (
          <button
            type="button"
            onClick={onOpenAskAll}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#201D1A]/10 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#201D1A]/80 shadow-2xs transition hover:border-[#0F6E56]/40 hover:bg-[#0F6E56]/5 hover:text-[#0F6E56] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#F3F4F6]/80 dark:hover:border-[#3EC79A]/40 dark:hover:bg-[#3EC79A]/10 dark:hover:text-[#3EC79A] dark:focus-visible:outline-[#3EC79A]"
          >
            <SparkleIcon className="h-4 w-4 text-[#0F6E56] dark:text-[#3EC79A]" />
            <span className="hidden sm:inline">Ask across all calls</span>
            <span className="sm:hidden">Ask all</span>
          </button>
        )}

        <Link
          href="/upload"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#0F6E56] px-4 py-2.5 text-sm font-semibold text-white shadow-2xs transition hover:bg-[#0c5945] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:bg-[#3EC79A] dark:text-[#0B0F19] dark:hover:bg-[#35b58b] dark:focus-visible:outline-[#3EC79A]"
        >
          <UploadIcon className="h-4 w-4" />
          Upload a recording
        </Link>
      </div>

      <p className="mt-3 text-xs font-medium text-[#201D1A]/60 dark:text-[#F3F4F6]/60" aria-live="polite">
        {searching
          ? `${results.length} of ${meetings.length} calls`
          : `${meetings.length} ${meetings.length === 1 ? "call" : "calls"}`}
      </p>

      {meetings.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[#201D1A]/15 bg-white p-10 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <p className="font-bold text-[#201D1A] dark:text-[#F3F4F6]">No calls yet</p>
          <p className="mt-1 text-xs text-[#201D1A]/60 dark:text-[#F3F4F6]/60">
            Upload a recording to get a transcript, summary and action items.
          </p>
          <Link
            href="/upload"
            className="mt-4 inline-block rounded-lg bg-[#0F6E56] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#0c5945] dark:bg-[#3EC79A] dark:text-[#0B0F19] dark:hover:bg-[#35b58b]"
          >
            Upload a recording
          </Link>
        </div>
      ) : results.length > 0 ? (
        <div className="mt-6">
          <CardList matches={results} playlists={playlists} narrow={narrow} />
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-[#201D1A]/15 bg-white p-10 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <p className="font-bold text-[#201D1A] dark:text-[#F3F4F6]">No calls match &ldquo;{query.trim()}&rdquo;</p>
          <p className="mt-1 text-xs text-[#201D1A]/60 dark:text-[#F3F4F6]/60">
            Try a different title or an attendee&rsquo;s name.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-4 rounded-lg bg-[#0F6E56] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#0c5945] dark:bg-[#3EC79A] dark:text-[#0B0F19] dark:hover:bg-[#35b58b]"
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
