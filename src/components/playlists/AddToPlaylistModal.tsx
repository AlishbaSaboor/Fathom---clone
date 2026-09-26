"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { ApiErrorBody } from "@/lib/recordings/types";
import type { PlaylistSummary } from "@/types/meeting";

/** From My Calls: lets the visitor add or remove one recording from any of their playlists, and create a new one on the spot. */
export function AddToPlaylistModal({
  open,
  onClose,
  meetingId,
  playlists,
}: {
  open: boolean;
  onClose: () => void;
  meetingId: string;
  playlists: PlaylistSummary[];
}) {
  const router = useRouter();
  const { show, toast } = useToast();
  const [items, setItems] = useState(playlists);
  // Resyncs local (optimistic) state whenever the server sends fresh playlists (e.g. after router.refresh()),
  // without an effect — see https://react.dev/learn/you-might-not-need-an-effect#adjusting-state-based-on-a-prop.
  const [prevPlaylists, setPrevPlaylists] = useState(playlists);
  if (playlists !== prevPlaylists) {
    setPrevPlaylists(playlists);
    setItems(playlists);
  }
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  async function errorMessage(res: Response): Promise<string> {
    try {
      return ((await res.json()) as ApiErrorBody).error.message;
    } catch {
      return "Something went wrong. Please try again.";
    }
  }

  async function toggle(playlist: PlaylistSummary, checked: boolean) {
    setItems((prev) =>
      prev.map((p) =>
        p.id === playlist.id ? { ...p, meetingIds: checked ? [...p.meetingIds, meetingId] : p.meetingIds.filter((id) => id !== meetingId) } : p,
      ),
    );
    try {
      const res = checked
        ? await fetch(`/api/playlists/${playlist.id}/meetings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ meetingId }),
          })
        : await fetch(`/api/playlists/${playlist.id}/meetings/${meetingId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await errorMessage(res));
      router.refresh();
    } catch (e) {
      // Revert the optimistic change.
      setItems((prev) =>
        prev.map((p) =>
          p.id === playlist.id ? { ...p, meetingIds: checked ? p.meetingIds.filter((id) => id !== meetingId) : [...p.meetingIds, meetingId] } : p,
        ),
      );
      show(e instanceof Error ? e.message : "Couldn't reach the server. Check your connection and try again.", "error");
    }
  }

  async function createAndAdd() {
    const name = newName.trim();
    if (!name || creating) return;
    setCreating(true);
    try {
      const createRes = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!createRes.ok) throw new Error(await errorMessage(createRes));
      const playlist = (await createRes.json()) as PlaylistSummary;

      const addRes = await fetch(`/api/playlists/${playlist.id}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId }),
      });
      if (!addRes.ok) throw new Error(await errorMessage(addRes));

      setItems((prev) => [{ ...playlist, meetingIds: [meetingId] }, ...prev]);
      setNewName("");
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Couldn't reach the server. Check your connection and try again.", "error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add to playlist">
      <div className="max-h-64 space-y-1 overflow-y-auto">
        {items.length === 0 ? (
          <p className="py-2 text-sm text-[#2B241C]/60 dark:text-[#F2EDDD]/60">You don&rsquo;t have any playlists yet.</p>
        ) : (
          items.map((playlist) => {
            const checked = playlist.meetingIds.includes(meetingId);
            return (
              <label
                key={playlist.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-[#2B241C]/5 dark:hover:bg-[#F2EDDD]/10"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => void toggle(playlist, e.target.checked)}
                  className="h-4 w-4 rounded border-[#2B241C]/30 text-[#0F6E56] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:border-[#F2EDDD]/30 dark:text-[#3EC79A]"
                />
                <span className="min-w-0 flex-1 truncate">{playlist.name}</span>
              </label>
            );
          })
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void createAndAdd();
        }}
        className="mt-4 flex items-center gap-2 border-t border-[#2B241C]/10 pt-4 dark:border-[#F2EDDD]/10"
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New playlist name"
          maxLength={100}
          className="min-w-0 flex-1 rounded-lg border border-[#2B241C]/20 bg-white px-3 py-2 text-sm outline-none placeholder:text-[#2B241C]/40 focus:border-[#0F6E56] focus:ring-2 focus:ring-[#0F6E56]/25 dark:border-[#F2EDDD]/20 dark:bg-[#101B33] dark:placeholder:text-[#F2EDDD]/40 dark:focus:border-[#3EC79A] dark:focus:ring-[#3EC79A]/25"
        />
        <button
          type="submit"
          disabled={!newName.trim() || creating}
          className="shrink-0 rounded-lg bg-[#0F6E56] px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#3EC79A] dark:text-[#101B33]"
        >
          {creating ? "Creating…" : "Create"}
        </button>
      </form>
      {toast}
    </Modal>
  );
}
