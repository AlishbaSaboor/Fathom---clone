"use client";

import { useState } from "react";
import { PlayIcon } from "@/components/ui/icons";
import { formatTimestamp } from "@/lib/format";
import type { Meeting } from "@/types/meeting";

// Deliberately static. Recording, capture and playback are out of scope for
// this build (a scope decision, not a shortfall), so this is a generated poster
// with a play icon and non-functional controls. Highlights are still marked on
// the progress bar so the timeline reads like the real player.
export function VideoPlaceholder({ meeting, note: customNote }: { meeting: Meeting; note?: string }) {
  const [note, setNote] = useState(false);

  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-xl"
      style={{ backgroundImage: `linear-gradient(135deg, ${meeting.poster.from}, ${meeting.poster.to})` }}
    >
      <button
        type="button"
        onClick={() => setNote(true)}
        aria-label="Play recording (not available in this build)"
        className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-lg transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <PlayIcon className="ml-1 h-7 w-7" />
      </button>

      {note && (
        <p
          role="status"
          className="absolute left-1/2 top-[calc(50%+3rem)] -translate-x-1/2 rounded-md bg-black/70 px-3 py-1.5 text-center text-xs text-white"
        >
          {customNote ?? "Playback is stubbed: recording and capture are out of scope for this build."}
        </p>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8 text-xs text-white">
        <span className="tabular-nums">0:00</span>
        <div className="relative h-1.5 flex-1 rounded-full bg-white/30" aria-hidden>
          {meeting.highlights.map((h) => (
            <span
              key={h.id}
              title={`Highlight at ${formatTimestamp(h.timestamp)}`}
              className="absolute top-1/2 h-3 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-amber-300"
              style={{ left: `${(h.timestamp / meeting.durationSec) * 100}%` }}
            />
          ))}
        </div>
        <span className="tabular-nums">{formatTimestamp(meeting.durationSec)}</span>
      </div>
    </div>
  );
}
