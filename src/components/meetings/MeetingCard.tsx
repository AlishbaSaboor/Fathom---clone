"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AvatarStack } from "@/components/ui/Avatar";
import { DropdownMenu, type MenuItem } from "@/components/ui/DropdownMenu";
import { LinkIcon, MoreVerticalIcon, PlayIcon, TrashIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/Toast";
import { copyRich } from "@/lib/clipboard";
import { formatDateTime, formatDuration } from "@/lib/format";
import type { ApiErrorBody } from "@/lib/recordings/types";
import type { MeetingMatch } from "@/lib/search";

export function MeetingCard({ match }: { match: MeetingMatch }) {
  const { meeting, matchedAttendees } = match;
  const router = useRouter();
  const { show, toast } = useToast();

  async function copyShareLink() {
    const ok = await copyRich(`${window.location.origin}/share/${meeting.shareToken}`);
    show(ok ? "Share link copied" : "Couldn't copy the link", ok ? "success" : "error");
  }

  const menu: MenuItem[] = [
    { id: "share", label: "Copy Share Link", icon: <LinkIcon className="h-4 w-4" />, onSelect: () => void copyShareLink() },
    { id: "delete", label: "Delete", icon: <TrashIcon className="h-4 w-4" />, danger: true, onSelect: () => void remove() },
  ];

  async function remove() {
    if (!window.confirm(`Delete "${meeting.title}"? The recording, its transcript and its share link are permanently removed and can't be recovered.`)) return;
    try {
      const res = await fetch(`/api/meetings/${meeting.id}`, { method: "DELETE" });
      if (res.ok) return router.refresh();
      const message = ((await res.json().catch(() => null)) as ApiErrorBody | null)?.error.message;
      show(message ?? "Couldn't delete that recording. Please try again.", "error");
    } catch {
      show("Couldn't reach the server. Check your connection and try again.", "error");
    }
  }

  return (
    <div className="group relative flex w-full">
      <Link
        href={`/meetings/${meeting.id}`}
        className="flex w-full flex-col overflow-hidden rounded-2xl border border-[#2B241C]/15 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:border-[#F2EDDD]/15 dark:bg-[#101B33]"
      >
        {/* A generated gradient, unique to the recording; the real player is on its detail page. */}
        <div
          className="relative flex h-32 items-center justify-center"
          style={{ backgroundImage: `linear-gradient(135deg, ${meeting.poster.from}, ${meeting.poster.to})` }}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#2B241C] shadow transition group-hover:scale-105">
            <PlayIcon className="ml-0.5 h-5 w-5" />
          </span>
          <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {formatDuration(meeting.durationSec)}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div>
            <h2 className="line-clamp-2 text-base font-semibold leading-snug">{meeting.title}</h2>
            <p className="mt-1 text-sm text-[#2B241C]/60 dark:text-[#F2EDDD]/60">{formatDateTime(meeting.date)}</p>
          </div>

          {matchedAttendees.length > 0 && (
            <p className="rounded-md bg-[#0F6E56]/10 px-2 py-1 text-xs text-[#0F6E56] dark:bg-[#3EC79A]/15 dark:text-[#3EC79A]">
              Attendee match: {matchedAttendees.map((a) => a.name).join(", ")}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#2B241C]/10 pt-3 dark:border-[#F2EDDD]/10">
            <AvatarStack attendees={meeting.attendees} ringClassName="ring-white dark:ring-[#101B33]" />
            <span className="text-xs text-[#2B241C]/60 dark:text-[#F2EDDD]/60">
              {meeting.actionItemCount} {meeting.actionItemCount === 1 ? "action item" : "action items"}
            </span>
          </div>
        </div>
      </Link>

      {/* A sibling of the link, not inside it: a button can't be nested in an anchor. */}
      <div className="absolute right-2 top-2 z-10">
        <DropdownMenu
          items={menu}
          ariaLabel={`More actions for ${meeting.title}`}
          align="right"
          menuClassName="w-48"
          triggerClassName="flex h-8 w-8 items-center justify-center rounded-md bg-black/55 text-white opacity-0 transition hover:bg-black/75 focus-visible:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100"
          triggerChildren={<MoreVerticalIcon className="h-4 w-4" />}
        />
      </div>
      {toast}
    </div>
  );
}
