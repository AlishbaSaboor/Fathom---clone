"use client";

import { useEffect, useRef, useState } from "react";
import { AvatarStack } from "@/components/ui/Avatar";
import { CheckIcon, LinkIcon } from "@/components/ui/icons";
import { transcriptToText } from "@/lib/export";
import { formatDateTime, formatDuration } from "@/lib/format";
import type { Meeting } from "@/types/meeting";
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
      className="inline-flex items-center gap-2 rounded-md bg-[#0F6E56] px-3 py-2 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:bg-[#3EC79A] dark:text-[#101B33] dark:focus-visible:outline-[#3EC79A]"
    >
      {copied ? <CheckIcon className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
      <span aria-live="polite">{copied ? "Share link copied" : "Share"}</span>
    </button>
  );
}

/** A filename-safe version of the title, so the downloaded file doesn't trip over slashes, colons, etc. */
const filenameSafe = (title: string) => title.replace(/[\\/:*?"<>|]+/g, "").trim().slice(0, 80) || "transcript";

/**
 * Title, date/time, duration, attendees, and the one Share button (not
 * duplicated in the header — see app/meetings/[id]/layout.tsx), plus the
 * owner-only "…" menu. Transcript download is self-contained: it only needs
 * `meeting`, already in hand, so no callback prop from the page is needed for it.
 */
export function MeetingInfoHeader({
  meeting,
  readOnly,
  onDelete,
  onDownload,
}: {
  meeting: Meeting;
  readOnly: boolean;
  /** Owner only: delete the recording, its file and its share link. */
  onDelete?: () => void;
  /** Owner only: save the original file. */
  onDownload?: () => void;
}) {
  function downloadTranscript() {
    const blob = new Blob([transcriptToText(meeting)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filenameSafe(meeting.title)}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold leading-snug sm:text-2xl">{meeting.title}</h1>
        <p className="mt-1 text-sm text-[#2B241C]/60 dark:text-[#F2EDDD]/60">
          {formatDateTime(meeting.date)} · {formatDuration(meeting.durationSec)}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <AvatarStack attendees={meeting.attendees} max={6} ringClassName="ring-white dark:ring-[#101B33]" />
          <span className="min-w-0 truncate text-sm text-[#2B241C]/70 dark:text-[#F2EDDD]/70">
            {meeting.attendees.map((a) => a.name).join(", ")}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-stretch gap-2">
        <ShareButton path={`/share/${meeting.shareToken}`} />
        {!readOnly && onDownload && onDelete && (
          <MeetingMenu onDownload={onDownload} onDownloadTranscript={downloadTranscript} onDelete={onDelete} />
        )}
      </div>
    </div>
  );
}
