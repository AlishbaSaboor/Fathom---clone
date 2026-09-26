"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { ApiErrorBody } from "@/lib/recordings/types";
import type { PlaylistSummary } from "@/types/meeting";

export function CreatePlaylistModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { show, toast } = useToast();
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  // True once creation succeeds, until the browser actually lands on the new page (which
  // unmounts this modal). Keeping it open with this state — instead of closing it right
  // away — means there's continuous feedback across the redirect rather than a gap where
  // the old page just sits there while the new one's database reads are still in flight.
  const [redirecting, setRedirecting] = useState(false);

  async function create() {
    const clean = name.trim();
    if (!clean || pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clean }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
        show(body?.error.message ?? "Something went wrong. Please try again.", "error");
        setPending(false);
        return;
      }
      const playlist = (await res.json()) as PlaylistSummary;
      setRedirecting(true);
      // No router.refresh() here: it's not needed (a push to a brand-new dynamic route
      // already fetches fresh data — see staleTimes.dynamic in Next's docs) and calling
      // it immediately after push() raced the navigation, causing the list page to render
      // stale/misplaced content. `add=1` tells the new page to open its own "Add
      // recordings" dialog right away.
      router.push(`/playlists/${playlist.id}?add=1`);
    } catch {
      show("Couldn't reach the server. Check your connection and try again.", "error");
      setPending(false);
    }
  }

  function reset() {
    setName("");
    setPending(false);
    setRedirecting(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={reset} title="New playlist">
      {redirecting ? (
        <div role="status" className="flex items-center gap-3 py-2 text-sm text-[#2B241C]/70 dark:text-[#F2EDDD]/70">
          <span
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#0F6E56]/25 border-t-[#0F6E56] dark:border-[#3EC79A]/25 dark:border-t-[#3EC79A]"
            aria-hidden
          />
          Opening your playlist…
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void create();
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="playlist-name" className="mb-1.5 block text-sm font-medium">
              Name
            </label>
            <input
              id="playlist-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              placeholder="e.g. Onboarding calls"
              className="w-full rounded-lg border border-[#2B241C]/20 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-[#2B241C]/40 focus:border-[#0F6E56] focus:ring-2 focus:ring-[#0F6E56]/25 dark:border-[#F2EDDD]/20 dark:bg-[#101B33] dark:placeholder:text-[#F2EDDD]/40 dark:focus:border-[#3EC79A] dark:focus:ring-[#3EC79A]/25"
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim() || pending}
            className="w-full rounded-lg bg-[#0F6E56] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#3EC79A] dark:text-[#101B33]"
          >
            {pending ? "Creating…" : "Create playlist"}
          </button>
        </form>
      )}
      {toast}
    </Modal>
  );
}
