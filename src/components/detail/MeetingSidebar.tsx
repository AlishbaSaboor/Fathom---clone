"use client";

import { useEffect, useRef, useState } from "react";
import { AvatarStack } from "@/components/ui/Avatar";
import { CopyButton } from "@/components/ui/CopyButton";
import { CalendarIcon, CheckIcon, ClockIcon, DiamondIcon, LinkIcon } from "@/components/ui/icons";
import { actionItemsToText } from "@/lib/export";
import { formatDate, formatDuration, formatTimestamp } from "@/lib/format";
import type { Meeting } from "@/types/meeting";
import { ActionItemList } from "./ActionItemList";

const platformLabel = { zoom: "Zoom", meet: "Google Meet", teams: "Microsoft Teams" } as const;

// Copies the public share link. The link is a route that needs no login; see
// app/(share)/share/[token]. There is no revocation or expiry (stubbed).
function ShareButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/share/${token}`);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable; nothing to recover.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="flex w-full items-center justify-between rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
    >
      <span aria-live="polite">{copied ? "Share link copied" : "Share"}</span>
      {copied ? <CheckIcon className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
    </button>
  );
}

export function MeetingSidebar({
  meeting,
  done,
  onToggle,
  onJump,
  readOnly,
}: {
  meeting: Meeting;
  done: Record<string, boolean>;
  onToggle: (id: string) => void;
  onJump: (t: number) => void;
  readOnly: boolean;
}) {
  const people = new Map(meeting.attendees.map((a) => [a.id, a]));
  const doneCount = meeting.actionItems.filter((a) => done[a.id]).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold leading-snug">{meeting.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <CalendarIcon className="h-3.5 w-3.5" />
            {formatDate(meeting.date)}
          </span>
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="h-3.5 w-3.5" />
            {formatDuration(meeting.durationSec)}
          </span>
          <span>{platformLabel[meeting.platform]}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <AvatarStack attendees={meeting.attendees} max={6} />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{meeting.attendees.length} attendees</span>
        </div>
      </div>

      {!readOnly && <ShareButton token={meeting.shareToken} />}

      <section aria-labelledby="action-items-heading">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 id="action-items-heading" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Action items
            <span className="ml-2 font-normal normal-case tracking-normal">
              {doneCount} of {meeting.actionItems.length} done
            </span>
          </h2>
          <CopyButton
            label="Copy"
            getText={() => actionItemsToText(meeting.actionItems, done, meeting.attendees)}
          />
        </div>

        <ActionItemList
          items={meeting.actionItems}
          attendees={meeting.attendees}
          done={done}
          onToggle={onToggle}
          onJump={onJump}
          readOnly={readOnly}
        />
      </section>

      {/* "Internal team only" mirrors the real product: annotations are notes for
          the owner's team, so the public share view hides this panel. */}
      {!readOnly && (
        <section aria-labelledby="annotations-heading">
          <h2 id="annotations-heading" className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Annotations
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
              INTERNAL TEAM ONLY
            </span>
          </h2>
          <ul className="space-y-3">
            {meeting.highlights.map((h) => (
              <li key={h.id} className="flex items-start gap-2.5">
                <DiamondIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-violet-600 dark:text-violet-300" />
                <div className="min-w-0 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold text-violet-700 dark:text-violet-300">Highlight</span>
                    <button
                      type="button"
                      onClick={() => onJump(h.timestamp)}
                      title="Jump to this moment in the transcript"
                      className="rounded px-1 text-xs tabular-nums text-violet-600 hover:underline dark:text-violet-300"
                    >
                      @ {formatTimestamp(h.timestamp)}
                    </button>
                  </p>
                  <p className="mt-0.5 leading-snug text-zinc-700 dark:text-zinc-300">{h.note}</p>
                  {people.get(h.createdById) && (
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {people.get(h.createdById)!.name}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
