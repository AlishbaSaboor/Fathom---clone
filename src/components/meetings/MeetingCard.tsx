"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DropdownMenu, type MenuItem } from "@/components/ui/DropdownMenu";
import { LinkIcon, MoreVerticalIcon, PlaylistIcon, TrashIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/Toast";
import { copyRich } from "@/lib/clipboard";
import type { ApiErrorBody } from "@/lib/recordings/types";
import type { MeetingMatch } from "@/lib/search";
import type { PlaylistSummary } from "@/types/meeting";
import { AddToPlaylistModal } from "@/components/playlists/AddToPlaylistModal";
import { MeetingCardBody } from "./MeetingCardBody";

export function MeetingCard({ match, playlists }: { match: MeetingMatch; playlists: PlaylistSummary[] }) {
  const { meeting, matchedAttendees } = match;
  const router = useRouter();
  const { show, toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);

  async function copyShareLink() {
    const ok = await copyRich(`${window.location.origin}/share/${meeting.shareToken}`);
    show(ok ? "Share link copied" : "Couldn't copy the link", ok ? "success" : "error");
  }

  const menu: MenuItem[] = [
    { id: "share", label: "Copy Share Link", icon: <LinkIcon className="h-4 w-4" />, onSelect: () => void copyShareLink() },
    { id: "add-to-playlist", label: "Add to Playlist", icon: <PlaylistIcon className="h-4 w-4" />, onSelect: () => setAddOpen(true) },
    { id: "delete", label: "Delete", icon: <TrashIcon className="h-4 w-4" />, danger: true, separatorBefore: true, onSelect: () => void remove() },
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
        className="flex w-full flex-col overflow-hidden rounded-2xl border border-[#201D1A]/10 bg-white shadow-xs transition hover:-translate-y-0.5 hover:shadow-md hover:border-[#0F6E56]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-[#3EC79A]/40 dark:focus-visible:outline-[#3EC79A]"
      >
        <MeetingCardBody meeting={meeting} matchedAttendees={matchedAttendees} />
      </Link>

      <div className="absolute right-2 top-2 z-10">
        <DropdownMenu
          items={menu}
          ariaLabel={`More actions for ${meeting.title}`}
          align="right"
          menuClassName="w-48"
          triggerClassName="flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-white backdrop-blur-xs transition hover:bg-black/70 focus-visible:opacity-100 group-hover:bg-black/60"
          triggerChildren={<MoreVerticalIcon className="h-4 w-4" />}
        />
      </div>
      {toast}

      <AddToPlaylistModal open={addOpen} onClose={() => setAddOpen(false)} meetingId={meeting.id} playlists={playlists} />
    </div>
  );
}
