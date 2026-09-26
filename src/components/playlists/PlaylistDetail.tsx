"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LinkIcon, PlaylistIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/Toast";
import { copyRich } from "@/lib/clipboard";
import type { ApiErrorBody } from "@/lib/recordings/types";
import type { MeetingListItem } from "@/types/meeting";
import { AddRecordingsModal } from "./AddRecordingsModal";
import { DeletePlaylistModal } from "./DeletePlaylistModal";
import { PlaylistMeetingCard } from "./PlaylistMeetingCard";

export function PlaylistDetail({
  id,
  name,
  shareToken,
  meetings,
  availableMeetings,
  autoOpenAdd = false,
}: {
  id: string;
  name: string;
  shareToken: string;
  meetings: MeetingListItem[];
  availableMeetings: MeetingListItem[];
  /** Opens "Add recordings" immediately — set right after creating a playlist, so the next thing seen is the checklist. */
  autoOpenAdd?: boolean;
}) {
  const router = useRouter();
  const { show, toast } = useToast();
  const [adding, setAdding] = useState(autoOpenAdd);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Strips ?add=1 right after using it, so reloading this page later doesn't reopen the dialog on its own.
  useEffect(() => {
    if (autoOpenAdd) router.replace(`/playlists/${id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only ever meant to run once, right after mount
  }, []);

  async function copyShareLink() {
    const ok = await copyRich(`${window.location.origin}/share/playlists/${shareToken}`);
    show(ok ? "Share link copied" : "Couldn't copy the link", ok ? "success" : "error");
  }

  async function removePlaylist() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/playlists/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.replace("/playlists");
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

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
          <p className="mt-1 text-sm text-[#2B241C]/60 dark:text-[#F2EDDD]/60">
            {meetings.length} {meetings.length === 1 ? "recording" : "recordings"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copyShareLink()}
            className="inline-flex items-center gap-2 rounded-lg border border-[#2B241C]/20 px-4 py-2.5 text-sm font-semibold transition hover:bg-[#2B241C]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:border-[#F2EDDD]/20 dark:hover:bg-[#F2EDDD]/5 dark:focus-visible:outline-[#3EC79A]"
          >
            <LinkIcon className="h-4 w-4" />
            Copy Share Link
          </button>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0F6E56] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:bg-[#3EC79A] dark:text-[#101B33] dark:focus-visible:outline-[#3EC79A]"
          >
            <PlusIcon className="h-4 w-4" />
            Add recordings
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            aria-label="Delete playlist"
            title="Delete playlist"
            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/40"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {meetings.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[#2B241C]/25 p-10 text-center dark:border-[#F2EDDD]/25">
          <PlaylistIcon className="mx-auto h-8 w-8 text-[#2B241C]/40 dark:text-[#F2EDDD]/40" />
          <p className="mt-3 font-medium">No recordings in this playlist yet</p>
          <p className="mt-1 text-sm text-[#2B241C]/60 dark:text-[#F2EDDD]/60">Add one of your recordings to get started.</p>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-4 inline-block rounded-md bg-[#0F6E56] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 dark:bg-[#3EC79A] dark:text-[#101B33]"
          >
            Add recordings
          </button>
        </div>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <li key={meeting.id} className="flex">
              <PlaylistMeetingCard playlistId={id} meeting={meeting} />
            </li>
          ))}
        </ul>
      )}

      <AddRecordingsModal open={adding} onClose={() => setAdding(false)} playlistId={id} available={availableMeetings} />
      <DeletePlaylistModal
        open={confirmOpen}
        name={name}
        pending={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void removePlaylist()}
      />
      {toast}
    </>
  );
}
