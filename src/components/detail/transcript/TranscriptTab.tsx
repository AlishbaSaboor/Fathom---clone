"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/CopyButton";
import { ChevronDownIcon, ListCheckIcon, SearchIcon, XIcon } from "@/components/ui/icons";
import { transcriptToText } from "@/lib/export";
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
          <mark key={i} className="rounded bg-yellow-200 px-0.5 font-semibold text-[#201D1A] dark:bg-yellow-400/80">
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
  activeSegmentId?: string;
  onSeek?: (seconds: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState(0);

  const people = useMemo(() => new Map(meeting.attendees.map((a) => [a.id, a])), [meeting.attendees]);

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

  useEffect(() => {
    if (!jump) return;
    const id = segmentIdAt(meeting.transcript, jump.time);
    const el = id ? document.getElementById(`seg-${id}`) : null;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    el.animate([{ backgroundColor: "rgba(15, 110, 86, 0.35)" }, { backgroundColor: "rgba(15, 110, 86, 0)" }], {
      duration: 1800,
    });
  }, [jump, meeting.transcript]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#201D1A]/8 pb-3 dark:border-white/8">
        <div>
          <h2 className="text-base font-bold text-[#201D1A] dark:text-[#F3F4F6]">Full Transcript</h2>
          <span className="text-xs text-[#201D1A]/60 dark:text-[#F3F4F6]/60">Speaker diarized & searchable</span>
        </div>

        {/* Search transcript and Copy transcript side by side */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <div className="relative w-44 sm:w-60">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#201D1A]/40 dark:text-[#F3F4F6]/40" />
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
              placeholder="Search transcript..."
              aria-label="Search transcript"
              className="w-full rounded-lg border border-[#201D1A]/10 bg-white py-1.5 pl-9 pr-8 text-xs outline-none placeholder:text-[#201D1A]/40 focus:border-[#0F6E56] dark:border-white/10 dark:bg-white/[0.04] dark:placeholder:text-[#F3F4F6]/40 dark:focus:border-[#3EC79A] [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear transcript search"
                onClick={() => {
                  setQuery("");
                  setCurrent(0);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-[#201D1A]/40 hover:text-[#201D1A] dark:text-[#F3F4F6]/40 dark:hover:text-[#F3F4F6]"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {q && (
            <div className="flex items-center gap-1 text-xs text-[#201D1A]/60 dark:text-[#F3F4F6]/60" aria-live="polite">
              <span className="tabular-nums font-medium">
                {matchIds.length ? `${Math.min(current, matchIds.length - 1) + 1} of ${matchIds.length}` : "No results"}
              </span>
              <button
                type="button"
                aria-label="Previous result"
                disabled={!matchIds.length}
                onClick={() => step(-1)}
                className="rounded p-1 hover:bg-[#201D1A]/5 disabled:opacity-40 dark:hover:bg-white/10"
              >
                <ChevronDownIcon className="h-4 w-4 rotate-180" />
              </button>
              <button
                type="button"
                aria-label="Next result"
                disabled={!matchIds.length}
                onClick={() => step(1)}
                className="rounded p-1 hover:bg-[#201D1A]/5 disabled:opacity-40 dark:hover:bg-white/10"
              >
                <ChevronDownIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          <CopyButton label="Copy Transcript" shortLabel="Copy" getText={() => transcriptToText(meeting)} />
        </div>
      </div>

      <ol className="space-y-3">
        {meeting.transcript.map((seg) => {
          const speaker = people.get(seg.speakerId);
          const isCurrent = seg.id === currentId;
          return (
            <li key={seg.id} id={`seg-${seg.id}`} className="scroll-mt-24 rounded-xl">
              {actionsBySegment.get(seg.id)?.map((a) => (
                <div key={a.id} className="mb-1.5 flex items-start gap-2 text-xs text-[#201D1A]/70 dark:text-[#F3F4F6]/70">
                  <ListCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0F6E56] dark:text-[#3EC79A]" />
                  <p>
                    <span className="font-bold uppercase tracking-wider text-[#0F6E56] dark:text-[#3EC79A]">Action item</span>
                    <span className="mx-1.5 opacity-40">···</span>
                    <span className="font-semibold text-[#201D1A] dark:text-[#F3F4F6]">{a.text}</span>
                  </p>
                </div>
              ))}

              <div className="flex gap-3">
                {onSeek ? (
                  <button
                    type="button"
                    onClick={() => onSeek(seg.start)}
                    title="Play from here"
                    className="w-12 shrink-0 self-start rounded pt-2 text-left font-mono text-xs font-semibold tabular-nums text-[#0F6E56] hover:underline dark:text-[#3EC79A]"
                  >
                    {formatTimestamp(seg.start)}
                  </button>
                ) : (
                  <span className="w-12 shrink-0 pt-2 font-mono text-xs tabular-nums text-[#201D1A]/50 dark:text-[#F3F4F6]/50">
                    {formatTimestamp(seg.start)}
                  </span>
                )}
                <div
                  className={`min-w-0 flex-1 rounded-xl border border-[#201D1A]/8 bg-white p-3 shadow-2xs dark:border-white/5 dark:bg-white/[0.02] ${
                    isCurrent
                      ? "ring-2 ring-amber-400"
                      : seg.id === activeSegmentId
                      ? "ring-2 ring-[#0F6E56] dark:ring-[#3EC79A]"
                      : ""
                  }`}
                >
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-bold" style={{ color: speaker?.avatarColor }}>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: speaker?.avatarColor }} aria-hidden />
                    <Marked text={speaker?.name ?? "Unknown"} query={q} />
                  </p>
                  <p className="text-sm leading-relaxed text-[#201D1A]/85 dark:text-[#F3F4F6]/85">
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
