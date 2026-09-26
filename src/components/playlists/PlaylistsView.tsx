"use client";

import { useState } from "react";
import { PlaylistIcon, PlusIcon } from "@/components/ui/icons";
import type { PlaylistSummary } from "@/types/meeting";
import { CreatePlaylistModal } from "./CreatePlaylistModal";
import { PlaylistCard } from "./PlaylistCard";

export function PlaylistsView({ playlists }: { playlists: PlaylistSummary[] }) {
  const [creating, setCreating] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Playlists.</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#0F6E56] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:bg-[#3EC79A] dark:text-[#101B33] dark:focus-visible:outline-[#3EC79A]"
        >
          <PlusIcon className="h-4 w-4" />
          New playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[#2B241C]/25 p-10 text-center dark:border-[#F2EDDD]/25">
          <PlaylistIcon className="mx-auto h-8 w-8 text-[#2B241C]/40 dark:text-[#F2EDDD]/40" />
          <p className="mt-3 font-medium">No playlists yet</p>
          <p className="mt-1 text-sm text-[#2B241C]/60 dark:text-[#F2EDDD]/60">
            Group recordings into a themed collection and share it as one link.
          </p>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="mt-4 inline-block rounded-md bg-[#0F6E56] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 dark:bg-[#3EC79A] dark:text-[#101B33]"
          >
            New playlist
          </button>
        </div>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <li key={playlist.id} className="flex">
              <PlaylistCard playlist={playlist} />
            </li>
          ))}
        </ul>
      )}

      <CreatePlaylistModal open={creating} onClose={() => setCreating(false)} />
    </>
  );
}
