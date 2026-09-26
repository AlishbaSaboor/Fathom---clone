"use client";

import { useState } from "react";
import type { MeetingListItem, PlaylistSummary } from "@/types/meeting";
import { AskAllPanel } from "./AskAllPanel";
import { MeetingGrid } from "./MeetingGrid";

export function MyCalls({ meetings, playlists }: { meetings: MeetingListItem[]; playlists: PlaylistSummary[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-[#201D1A] dark:text-[#F3F4F6]">My Calls.</h1>

      <MeetingGrid meetings={meetings} playlists={playlists} narrow={open} onOpenAskAll={() => setOpen(true)} />

      {/* Backdrop overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <AskAllPanel
        meetings={meetings}
        onClose={() => setOpen(false)}
        open={open}
        className={
          open
            ? "fixed inset-y-0 right-0 z-50 flex w-full max-w-[380px] rounded-none border-l border-[#201D1A]/10 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111827]"
            : "hidden"
        }
      />
    </>
  );
}
