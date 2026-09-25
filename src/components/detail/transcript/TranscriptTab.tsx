"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronDownIcon, ListCheckIcon, SearchIcon, XIcon } from "@/components/ui/icons";
import { formatTimestamp } from "@/lib/format";
import { escapeRegExp, segmentIdAt } from "@/lib/transcript";
import type { ActionItem, Meeting } from "@/types/meeting";
import type { JumpRequest } from "../MeetingDetail";

/** Wraps case-insensitive matches of `query` in <mark>. */
function Marked({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded bg-amber-200 px-0.5 text-zinc-900 dark:bg-amber-400/80">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function TranscriptTab({
  meeting,
  jump,
  activeSegmentId,
  onSeek,
}: {
  meeting: Meeting;
  jump: JumpRequest | null;
  /** The segment being spoken right now. */
  activeSegmentId?: string;
  /** Makes timestamps play the recording from that moment. */
  onSeek?: (seconds: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState(0);

  const people = useMemo(() => new Map(meeting.attendees.map((a) => [a.id, a])), [meeting.attendees]);

  // Action items are pinned to the segment being spoken at their timestamp, so they show inline in the transcript.
  const actionsBySegment = useMemo(() => {
    const bySegment = new Map<string, ActionItem[]>();
    for (const a of meeting.actionItems) {
      const id = segmentIdAt(meeting.transcript, a.timestamp);
      if (id) bySegment.set(id, [...(bySegment.get(id) ?? []), a]);
    }
    return bySegment;
  }, [meeting]);

  const q = query.trim().toLowerCase();
  const matchIds = useMemo(
    () =>
      q
        ? meeting.transcript
            .filter(
              (s) =>
                s.text.toLowerCase().includes(q) ||
                (people.get(s.speakerId)?.name.toLowerCase().includes(q) ?? false),
            )
            .map((s) => s.id)
        : [],
    [q, meeting.transcript, people],
  );
  const currentId = matchIds.length ? matchIds[Math.min(current, matchIds.length - 1)] : undefined;

  function scrollToSegment(id: string | undefined) {
    if (!id) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(`seg-${id}`)?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  }

  function step(delta: number) {
    if (!matchIds.length) return;
    const next = (current + delta + matchIds.length) % matchIds.length;
    setCurrent(next);
    scrollToSegment(matchIds[next]);
  }

  // Jump requests come from the summary and sidebar links. The
  // panel is already visible by the time this runs (the parent switches tabs
  // in the same update), so the target can be scrolled to and briefly flashed.
  useEffect(() => {
    if (!jump) return;
    const id = segmentIdAt(meeting.transcript, jump.time);
    const el = id ? document.getElementById(`seg-${id}`) : null;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    el.animate([{ backgroundColor: "rgba(139, 92, 246, 0.3)" }, { backgroundColor: "rgba(139, 92, 246, 0)" }], {
      duration: 1800,
    });
  }, [jump, meeting.transcript]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <div className="relative w-full max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrent(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                step(e.shiftKey ? -1 : 1);
              }
            }}
            placeholder="Search transcript"
            aria-label="Search transcript"
            className="w-full rounded-full border border-zinc-300 bg-white py-1.5 pl-9 pr-8 text-sm outline-none placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-900 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear transcript search"
              onClick={() => {
                setQuery("");
                setCurrent(0);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {q && (
          <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400" aria-live="polite">
            <span className="tabular-nums">
              {matchIds.length ? `${Math.min(current, matchIds.length - 1) + 1} of ${matchIds.length}` : "No results"}
            </span>
            <button
              type="button"
              aria-label="Previous result"
              disabled={!matchIds.length}
              onClick={() => step(-1)}
              className="rounded p-1 hover:bg-zinc-100 disabled:opacity-40 dark:hover:bg-zinc-800"
            >
              <ChevronDownIcon className="h-4 w-4 rotate-180" />
            </button>
            <button
              type="button"
              aria-label="Next result"
              disabled={!matchIds.length}
              onClick={() => step(1)}
              className="rounded p-1 hover:bg-zinc-100 disabled:opacity-40 dark:hover:bg-zinc-800"
            >
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <ol className="space-y-3">
        {meeting.transcript.map((seg) => {
          const speaker = people.get(seg.speakerId);
          const isCurrent = seg.id === currentId;
          return (
            <li key={seg.id} id={`seg-${seg.id}`} className="scroll-mt-24 rounded-lg">
              {actionsBySegment.get(seg.id)?.map((a) => (
                <div key={a.id} className="mb-1.5 flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <ListCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <p>
                    <span className="font-bold uppercase tracking-wide">Action item</span>
                    <span className="mx-1.5 text-zinc-400">···</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{a.text}</span>
                  </p>
                </div>
              ))}

              <div className="flex gap-3">
                {onSeek ? (
                  <button
                    type="button"
                    onClick={() => onSeek(seg.start)}
                    title="Play from here"
                    className="w-11 shrink-0 self-start rounded pt-2.5 text-left text-xs tabular-nums text-blue-600 hover:underline dark:text-blue-300"
                  >
                    {formatTimestamp(seg.start)}
                  </button>
                ) : (
                  <span className="w-11 shrink-0 pt-2.5 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                    {formatTimestamp(seg.start)}
                  </span>
                )}
                <div
                  className={`min-w-0 flex-1 rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-900 ${isCurrent ? "ring-2 ring-amber-400" : seg.id === activeSegmentId ? "ring-2 ring-blue-400" : ""}`}
                >
                  <p className="mb-0.5 flex items-center gap-1.5 text-xs font-semibold" style={{ color: speaker?.avatarColor }}>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: speaker?.avatarColor }} aria-hidden />
                    <Marked text={speaker?.name ?? "Unknown"} query={q} />
                  </p>
                  <p className="text-sm leading-relaxed">
                    <Marked text={seg.text} query={q} />
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
