"use client";

import { useState } from "react";
import { AskFathomButton } from "@/components/AskFathomButton";
import type { MeetingListItem, PlaylistSummary } from "@/types/meeting";
import { AskAllPanel } from "./AskAllPanel";
import { MeetingGrid } from "./MeetingGrid";

/**
 * My Calls: the call list with the account-level Ask Fathom panel. Closed by
 * default, on every screen size — the floating Ask Fathom button opens it, and
 * its own close button closes it, exactly like the meeting detail page's
 * panel; there's no separate desktop collapse-rail behavior. On desktop it
 * opens as a full-height column against the right edge; below that there's no
 * room for a column, so it opens as a full-screen overlay instead. The panel
 * stays mounted while closed, so a conversation survives closing and
 * reopening it.
 */

// Just under the app header: its 3.5rem row + the 1px border.
const BELOW_HEADER = "lg:top-[calc(3.5rem+1px)]";

export function MyCalls({ meetings, playlists }: { meetings: MeetingListItem[]; playlists: PlaylistSummary[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">My Calls.</h1>

      <MeetingGrid meetings={meetings} playlists={playlists} narrow={open} />

      <AskAllPanel
        meetings={meetings}
        onClose={() => setOpen(false)}
        open={open}
        className={
          open
            ? `fixed inset-0 z-30 flex rounded-none lg:inset-auto lg:right-0 ${BELOW_HEADER} lg:bottom-0 lg:z-0 lg:flex lg:w-[340px] lg:rounded-none lg:border-y-0 lg:border-r-0`
            : "hidden"
        }
      />

      {!open && <AskFathomButton onClick={() => setOpen(true)} className="flex" />}
    </>
  );
}
