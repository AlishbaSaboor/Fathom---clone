"use client";

import { useEffect, useRef, useState } from "react";
import { AvatarStack } from "@/components/ui/Avatar";
import { CalendarIcon, CheckIcon, ClockIcon, LinkIcon, UsersIcon } from "@/components/ui/icons";
import { transcriptToText } from "@/lib/export";
import { formatDateTime, formatDuration } from "@/lib/format";
import type { Meeting } from "@/types/meeting";
import { MeetingMenu } from "./MeetingMenu";

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
      // Clipboard unavailable
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F6E56] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0c5945] focus-visible:outline-2 focus-visible:outline-[#0F6E56] dark:bg-[#3EC79A] dark:text-[#0B0F19] dark:hover:bg-[#35b58b] dark:focus-visible:outline-[#3EC79A]"
    >
      {copied ? <CheckIcon className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
      <span aria-live="polite">{copied ? "Share link copied" : "Share"}</span>
    </button>
  );
}

const filenameSafe = (title: string) => title.replace(/[\\/:*?"<>|]+/g, "").trim().slice(0, 80) || "transcript";

export function MeetingInfoHeader({
  meeting,
  readOnly,
  onDelete,
  onDownload,
}: {
  meeting: Meeting;
  readOnly: boolean;
  onDelete?: () => void;
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
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-[#201D1A] dark:text-[#F3F4F6]">{meeting.title}</h1>
        
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-[#201D1A]/70 dark:text-[#F3F4F6]/70">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <CalendarIcon className="h-3.5 w-3.5 text-[#0F6E56] dark:text-[#3EC79A]" />
            {formatDateTime(meeting.date)}
          </span>
          <span className="opacity-40">•</span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <ClockIcon className="h-3.5 w-3.5 text-[#0F6E56] dark:text-[#3EC79A]" />
            {formatDuration(meeting.durationSec)}
          </span>
          <span className="opacity-40">•</span>
          <div className="inline-flex items-center gap-1.5 font-medium">
            <UsersIcon className="h-3.5 w-3.5 text-[#0F6E56] dark:text-[#3EC79A]" />
            <AvatarStack attendees={meeting.attendees} max={5} ringClassName="ring-white dark:ring-[#111827]" />
            <span className="min-w-0 truncate font-medium text-[#201D1A]/80 dark:text-[#F3F4F6]/80">
              {meeting.attendees.map((a) => a.name).join(", ")}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <ShareButton path={`/share/${meeting.shareToken}`} />
        {!readOnly && onDownload && onDelete && (
          <MeetingMenu onDownload={onDownload} onDownloadTranscript={downloadTranscript} onDelete={onDelete} />
        )}
      </div>
    </div>
  );
}
