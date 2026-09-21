"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SearchIcon, UploadIcon, XIcon } from "@/components/ui/icons";
import { useHydrated, useUploads } from "@/lib/recordings/storage";
import { toListItem } from "@/lib/recordings/toMeeting";
import { searchMeetings, type MeetingMatch } from "@/lib/search";
import type { MeetingListItem } from "@/types/meeting";
import { MeetingCard } from "./MeetingCard";

/** `narrow`: a side panel takes the right of the page, so the cards drop from three columns to two. */
export function MeetingGrid({ meetings, narrow = false }: { meetings: MeetingListItem[]; narrow?: boolean }) {
  const [query, setQuery] = useState("");
  // Recordings the user uploaded live in this browser (localStorage), so they
  // are merged in here on the client. Empty during server rendering.
  const uploads = useUploads();
  const all = useMemo(
    () => [...meetings, ...uploads.map(toListItem)].sort((a, b) => b.date.localeCompare(a.date)),
    [meetings, uploads],
  );
  const results = useMemo(() => searchMeetings(all, query), [all, query]);
  const searching = query.trim().length > 0;
  const hydrated = useHydrated();
  // Search runs over both groups together; the results are then split back into their sections.
  const yours = results.filter((m) => m.meeting.source === "upload");
  const mockups = results.filter((m) => m.meeting.source !== "upload");

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
        {searching ? `${results.length} of ${all.length} calls` : `${all.length} calls`}
      </p>

      {results.length > 0 ? (
        <>
          {/* While searching, a section with no hits is hidden; otherwise "Your Recordings" always shows. */}
          {(!searching || yours.length > 0) && (
            <Section title="Your Recordings" count={yours.length}>
              {yours.length > 0 ? (
                <CardList matches={yours} narrow={narrow} />
              ) : (
                hydrated && (
                  <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                    Upload a recording to see it here.{" "}
                    <Link href="/upload" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                      Upload a recording
                    </Link>
                  </div>
                )
              )}
            </Section>
          )}
          {mockups.length > 0 && (
            <Section title="Mockup" count={mockups.length}>
              <CardList matches={mockups} narrow={narrow} />
            </Section>
          )}
        </>
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

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="mt-8 first:mt-4" aria-label={title}>
      <h2 className="mb-3 flex items-baseline gap-2 text-lg font-semibold tracking-tight">
        {title}
        <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">{count}</span>
      </h2>
      {children}
    </section>
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
