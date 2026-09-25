"use client";

import { useEffect, useRef, useState } from "react";
import { AvatarStack } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { CalendarIcon, CheckIcon, ClockIcon, LinkIcon } from "@/components/ui/icons";
import { formatDate, formatDuration } from "@/lib/format";
import type { Meeting } from "@/types/meeting";
import { ActionItemActions } from "./ActionItemActions";
import { ActionItemList } from "./ActionItemList";
import { MeetingMenu } from "./MeetingMenu";

// Copies the public share link. The link is a route that needs no login; see
// app/(share)/share/[token]. It works until the owner deletes the recording. It
// is shown on the share page too, where it just copies the link the viewer is
// already on.
function ShareButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
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
      className="flex w-full items-center justify-between rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
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
  onDelete,
  onDownload,
}: {
  meeting: Meeting;
  done: Record<string, boolean>;
  onToggle: (id: string) => void;
  onJump: (t: number) => void;
  readOnly: boolean;
  /** Owner only: delete the recording, its file and its share link. */
  onDelete?: () => void;
  /** Owner only: save the original file. */
  onDownload?: () => void;
}) {
  const { show, toast } = useToast();
  const doneCount = meeting.actionItems.filter((a) => done[a.id]).length;

  return (
    // On desktop this is one stacked column. On mobile the wrapper disappears
    // (`contents`) so the header and body become separate grid items that
    // MeetingDetail orders as: video, header, tabs, then the body. Otherwise the
    // action items push the summary a few screens down the page.
    <div className="max-lg:contents lg:space-y-6">
      <div className="space-y-6 max-lg:[grid-area:head]">
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
        </div>
        <div className="mt-3 flex items-center gap-2">
          <AvatarStack attendees={meeting.attendees} max={6} />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{meeting.attendees.length} attendees</span>
        </div>
      </div>

      {/* Share, with the "…" menu beside it. The public share view has no menu: viewers can't download or delete. */}
      <div className="flex items-stretch gap-2">
        <div className="min-w-0 flex-1">
          <ShareButton path={`/share/${meeting.shareToken}`} />
        </div>
        {!readOnly && onDownload && onDelete && <MeetingMenu onDownload={onDownload} onDelete={onDelete} />}
      </div>
      </div>

      <div className="space-y-6 max-lg:[grid-area:side]">
      <section aria-labelledby="action-items-heading">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 id="action-items-heading" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Action items
            <span className="ml-2 font-normal normal-case tracking-normal">
              {doneCount} of {meeting.actionItems.length} done
            </span>
          </h2>
        </div>

        {meeting.actionItems.length > 0 && (
          <div className="mb-3">
            <ActionItemActions meeting={meeting} done={done} onNotify={show} />
          </div>
        )}

        <ActionItemList
          items={meeting.actionItems}
          attendees={meeting.attendees}
          done={done}
          onToggle={onToggle}
          onJump={onJump}
          readOnly={readOnly}
        />
      </section>

      </div>
      {toast}
    </div>
  );
}
