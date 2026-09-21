import type { Meeting } from "@/types/meeting";

// Stands in for the video on a shared upload. The recording itself is never
// stored server-side (it stays in the uploader's browser), so there is nothing
// to play: no player, no play button, just the poster and a plain note.
export function RecordingNote({ meeting, note }: { meeting: Meeting; note: string }) {
  return (
    <div
      className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl px-6"
      style={{ backgroundImage: `linear-gradient(135deg, ${meeting.poster.from}, ${meeting.poster.to})` }}
    >
      <p role="note" className="max-w-md rounded-lg bg-black/55 px-4 py-3 text-center text-sm font-medium text-white">
        {note}
      </p>
    </div>
  );
}
