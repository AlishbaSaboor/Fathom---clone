"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DropdownMenu, type MenuItem } from "@/components/ui/DropdownMenu";
import { LinkIcon, MoreVerticalIcon, PlaylistIcon, TrashIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/Toast";
import { copyRich } from "@/lib/clipboard";
import { formatDateTime } from "@/lib/format";
import type { ApiErrorBody } from "@/lib/recordings/types";
import type { PlaylistSummary } from "@/types/meeting";
import { DeletePlaylistModal } from "./DeletePlaylistModal";

export function PlaylistCard({ playlist }: { playlist: PlaylistSummary }) {
  const router = useRouter();
  const { show, toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function copyShareLink() {
    const ok = await copyRich(`${window.location.origin}/share/playlists/${playlist.shareToken}`);
    show(ok ? "Share link copied" : "Couldn't copy the link", ok ? "success" : "error");
  }

  async function remove() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/playlists/${playlist.id}`, { method: "DELETE" });
      if (res.ok) {
        setConfirmOpen(false);
        router.refresh();
        return;
      }
      const message = ((await res.json().catch(() => null)) as ApiErrorBody | null)?.error.message;
      show(message ?? "Couldn't delete that playlist. Please try again.", "error");
    } catch {
      show("Couldn't reach the server. Check your connection and try again.", "error");
    } finally {
      setDeleting(false);
    }
  }

  const menu: MenuItem[] = [
    { id: "share", label: "Copy Share Link", icon: <LinkIcon className="h-4 w-4" />, onSelect: () => void copyShareLink() },
    { id: "delete", label: "Delete", icon: <TrashIcon className="h-4 w-4" />, danger: true, separatorBefore: true, onSelect: () => setConfirmOpen(true) },
  ];

  return (
    <div className="group relative flex w-full">
      <Link
        href={`/playlists/${playlist.id}`}
        className="flex w-full flex-col overflow-hidden rounded-2xl border border-[#201D1A]/10 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md hover:border-[#0F6E56]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-[#3EC79A]/40 dark:focus-visible:outline-[#3EC79A]"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F6E56]/10 text-[#0F6E56] dark:bg-[#3EC79A]/15 dark:text-[#3EC79A]">
          <PlaylistIcon className="h-5 w-5" />
        </div>
        <h2 className="mt-4 line-clamp-2 text-base font-semibold leading-snug text-[#201D1A] dark:text-[#F3F4F6]">{playlist.name}</h2>
        <p className="mt-1 text-sm text-[#201D1A]/60 dark:text-[#F3F4F6]/60">
          {playlist.meetingIds.length} {playlist.meetingIds.length === 1 ? "recording" : "recordings"} · {formatDateTime(playlist.createdAt)}
        </p>
      </Link>

      <div className="absolute right-2 top-2 z-10">
        <DropdownMenu
          items={menu}
          ariaLabel={`More actions for ${playlist.name}`}
          align="right"
          menuClassName="w-48"
          triggerClassName="flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-white backdrop-blur-xs transition hover:bg-black/70 focus-visible:opacity-100 group-hover:bg-black/60"
          triggerChildren={<MoreVerticalIcon className="h-4 w-4" />}
        />
      </div>
      {toast}
      <DeletePlaylistModal
        open={confirmOpen}
        name={playlist.name}
        pending={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void remove()}
      />
    </div>
  );
}
