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
          <p className="py-2 text-sm text-[#2B241C]/60 dark:text-[#F2EDDD]/60">Every recording is already in this playlist.</p>
        ) : (
          available.map((meeting) => {
            const isAdded = added.has(meeting.id);
            const isPending = pending.has(meeting.id);
            return (
              <div
                key={meeting.id}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm hover:bg-[#2B241C]/5 dark:hover:bg-[#F2EDDD]/10"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{meeting.title}</p>
                  <p className="text-xs text-[#2B241C]/60 dark:text-[#F2EDDD]/60">{formatDateTime(meeting.date)}</p>
                </div>
                <button
                  type="button"
                  disabled={isAdded || isPending}
                  onClick={() => void add(meeting)}
                  className="shrink-0 rounded-md bg-[#0F6E56] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#3EC79A] dark:text-[#101B33]"
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
