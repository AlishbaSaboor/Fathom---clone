"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatDateTime } from "@/lib/format";
import type { ApiErrorBody } from "@/lib/recordings/types";
import type { MeetingListItem } from "@/types/meeting";

/** From a playlist's own page: adds one of the visitor's other recordings to it. Removal happens per-tile instead (PlaylistMeetingCard), so this only ever adds. */
export function AddRecordingsModal({
  open,
  onClose,
  playlistId,
  available,
}: {
  open: boolean;
  onClose: () => void;
  playlistId: string;
  available: MeetingListItem[];
}) {
  const router = useRouter();
  const { show, toast } = useToast();
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState<Set<string>>(new Set());
  // Resyncs when the server sends a fresh `available` list (e.g. after router.refresh()) — otherwise a meeting
  // added here, then removed via its own tile elsewhere, would still show as "Added" once it re-enters this list.
  // See AddToPlaylistModal for the same pattern: https://react.dev/learn/you-might-not-need-an-effect#adjusting-state-based-on-a-prop.
  const [prevAvailable, setPrevAvailable] = useState(available);
  if (available !== prevAvailable) {
    setPrevAvailable(available);
    setAdded(new Set());
  }

  async function add(meeting: MeetingListItem) {
    setPending((prev) => new Set(prev).add(meeting.id));
    try {
      const res = await fetch(`/api/playlists/${playlistId}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId: meeting.id }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
        show(body?.error.message ?? "Couldn't add that recording. Please try again.", "error");
        return;
      }
      setAdded((prev) => new Set(prev).add(meeting.id));
      router.refresh();
    } catch {
      show("Couldn't reach the server. Check your connection and try again.", "error");
    } finally {
      setPending((prev) => {
        const next = new Set(prev);
        next.delete(meeting.id);
        return next;
      });
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add recordings">
      <div className="max-h-80 space-y-1 overflow-y-auto">
        {available.length === 0 ? (
          <p className="py-2 text-sm text-[#201D1A]/60 dark:text-[#F3F4F6]/60">Every recording is already in this playlist.</p>
        ) : (
          available.map((meeting) => {
            const isAdded = added.has(meeting.id);
            const isPending = pending.has(meeting.id);
            return (
              <div
                key={meeting.id}
                className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm hover:bg-[#201D1A]/5 dark:hover:bg-white/[0.06] transition-colors"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-[#201D1A] dark:text-[#F3F4F6]">{meeting.title}</p>
                  <p className="text-xs text-[#201D1A]/60 dark:text-[#F3F4F6]/60">{formatDateTime(meeting.date)}</p>
                </div>
                <button
                  type="button"
                  disabled={isAdded || isPending}
                  onClick={() => void add(meeting)}
                  className="shrink-0 rounded-md bg-[#0F6E56] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0c5945] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#3EC79A] dark:text-[#0B0F19] dark:hover:bg-[#35b58b]"
                >
                  {isAdded ? "Added" : isPending ? "Adding…" : "Add"}
                </button>
              </div>
            );
          })
        )}
      </div>
      {toast}
    </Modal>
  );
}
