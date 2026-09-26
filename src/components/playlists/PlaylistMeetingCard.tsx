"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MeetingCardBody } from "@/components/meetings/MeetingCardBody";
import { DropdownMenu, type MenuItem } from "@/components/ui/DropdownMenu";
import { LinkIcon, MoreVerticalIcon, XIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/Toast";
import { copyRich } from "@/lib/clipboard";
import type { ApiErrorBody } from "@/lib/recordings/types";
import type { MeetingListItem } from "@/types/meeting";

/** A recording tile on a playlist's own detail page: same visuals as My Calls' MeetingCard, but "Remove from Playlist" instead of "Delete" — this never touches the recording itself. */
export function PlaylistMeetingCard({ playlistId, meeting }: { playlistId: string; meeting: MeetingListItem }) {
  const router = useRouter();
  const { show, toast } = useToast();

  async function copyShareLink() {
    const ok = await copyRich(`${window.location.origin}/share/${meeting.shareToken}`);
    show(ok ? "Share link copied" : "Couldn't copy the link", ok ? "success" : "error");
  }

  async function remove() {
    try {
      const res = await fetch(`/api/playlists/${playlistId}/meetings/${meeting.id}`, { method: "DELETE" });
      if (res.ok) return router.refresh();
      const message = ((await res.json().catch(() => null)) as ApiErrorBody | null)?.error.message;
      show(message ?? "Couldn't remove that recording. Please try again.", "error");
    } catch {
      show("Couldn't reach the server. Check your connection and try again.", "error");
    }
  }

  const menu: MenuItem[] = [
    { id: "share", label: "Copy Share Link", icon: <LinkIcon className="h-4 w-4" />, onSelect: () => void copyShareLink() },
    { id: "remove", label: "Remove from Playlist", icon: <XIcon className="h-4 w-4" />, danger: true, separatorBefore: true, onSelect: () => void remove() },
  ];

  return (
    <div className="group relative flex w-full">
      <Link
        href={`/meetings/${meeting.id}`}
        className="flex w-full flex-col overflow-hidden rounded-2xl border border-[#201D1A]/10 bg-white shadow-xs transition hover:border-[#201D1A]/20 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20"
      >
        <MeetingCardBody meeting={meeting} />
      </Link>

      <div className="absolute right-2 top-2 z-10">
        <DropdownMenu
          items={menu}
          ariaLabel={`More actions for ${meeting.title}`}
          align="right"
          menuClassName="w-52"
          triggerClassName="flex h-8 w-8 items-center justify-center rounded-md bg-black/55 text-white opacity-0 transition hover:bg-black/75 focus-visible:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100"
          triggerChildren={<MoreVerticalIcon className="h-4 w-4" />}
        />
      </div>
      {toast}
    </div>
  );
}
