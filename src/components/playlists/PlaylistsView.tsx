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
        <h1 className="text-2xl font-bold tracking-tight text-[#201D1A] dark:text-[#F3F4F6]">Playlists.</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#0F6E56] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0c5945] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:bg-[#3EC79A] dark:text-[#0B0F19] dark:hover:bg-[#35b58b] dark:focus-visible:outline-[#3EC79A]"
        >
          <PlusIcon className="h-4 w-4" />
          New playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[#201D1A]/15 p-10 text-center dark:border-white/15">
          <PlaylistIcon className="mx-auto h-8 w-8 text-[#201D1A]/40 dark:text-[#F3F4F6]/40" />
          <p className="mt-3 font-semibold text-[#201D1A] dark:text-[#F3F4F6]">No playlists yet</p>
          <p className="mt-1 text-sm text-[#201D1A]/60 dark:text-[#F3F4F6]/60">
            Group recordings into a themed collection and share it as one link.
          </p>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="mt-4 inline-block rounded-md bg-[#0F6E56] px-3.5 py-1.5 text-sm font-medium text-white hover:bg-[#0c5945] dark:bg-[#3EC79A] dark:text-[#0B0F19] dark:hover:bg-[#35b58b]"
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
