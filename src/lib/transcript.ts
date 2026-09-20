import type { TranscriptSegment } from "@/types/meeting";

/** The segment being spoken at `time`: the last one that starts at or before it. */
export function segmentIdAt(transcript: TranscriptSegment[], time: number): string | undefined {
  let found: string | undefined;
  for (const seg of transcript) {
    if (seg.start <= time) found = seg.id;
    else break;
  }
  return found ?? transcript[0]?.id;
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
