"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DropdownMenu, type MenuItem } from "@/components/ui/DropdownMenu";
import { LinkIcon, MoreVerticalIcon, PlaylistIcon, TrashIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/Toast";
import { copyRich } from "@/lib/clipboard";
import { formatDateTime } from "@/lib/format";
import type { ApiErrorBody } from "@/lib/recordings/types";
import type { PlaylistSummary } from "@/types/meeting";

export function PlaylistCard({ playlist }: { playlist: PlaylistSummary }) {
  const router = useRouter();
  const { show, toast } = useToast();

  async function copyShareLink() {
    const ok = await copyRich(`${window.location.origin}/share/playlists/${playlist.shareToken}`);
    show(ok ? "Share link copied" : "Couldn't copy the link", ok ? "success" : "error");
  }

  async function remove() {
    if (!window.confirm(`Delete "${playlist.name}"? The recordings in it aren't affected, but the share link stops working.`)) return;
    try {
      const res = await fetch(`/api/playlists/${playlist.id}`, { method: "DELETE" });
      if (res.ok) return router.refresh();
      const message = ((await res.json().catch(() => null)) as ApiErrorBody | null)?.error.message;
      show(message ?? "Couldn't delete that playlist. Please try again.", "error");
    } catch {
      show("Couldn't reach the server. Check your connection and try again.", "error");
    }
  }

  const menu: MenuItem[] = [
    { id: "share", label: "Copy Share Link", icon: <LinkIcon className="h-4 w-4" />, onSelect: () => void copyShareLink() },
    { id: "delete", label: "Delete", icon: <TrashIcon className="h-4 w-4" />, danger: true, separatorBefore: true, onSelect: () => void remove() },
  ];

  return (
    <div className="group relative flex w-full">
      <Link
        href={`/playlists/${playlist.id}`}
        className="flex w-full flex-col overflow-hidden rounded-2xl border border-[#2B241C]/15 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:border-[#F2EDDD]/15 dark:bg-[#101B33]"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F6E56]/10 text-[#0F6E56] dark:bg-[#3EC79A]/15 dark:text-[#3EC79A]">
          <PlaylistIcon className="h-5 w-5" />
        </div>
        <h2 className="mt-4 line-clamp-2 text-base font-semibold leading-snug">{playlist.name}</h2>
        <p className="mt-1 text-sm text-[#2B241C]/60 dark:text-[#F2EDDD]/60">
          {playlist.meetingIds.length} {playlist.meetingIds.length === 1 ? "recording" : "recordings"} · {formatDateTime(playlist.createdAt)}
        </p>
      </Link>

      <div className="absolute right-2 top-2 z-10">
        <DropdownMenu
          items={menu}
          ariaLabel={`More actions for ${playlist.name}`}
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
