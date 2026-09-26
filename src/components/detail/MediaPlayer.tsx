"use client";

import { useImperativeHandle, useRef } from "react";

export interface PlayerHandle {
  /** Jump to a time in the recording, optionally starting playback. */
  seek: (seconds: number, play?: boolean) => void;
}

/**
 * Compact media player for video or audio.
 * Constrained height so in 100% zoom view, the summary, jump nav, and action items remain visible.
 */
export function MediaPlayer({
  url,
  kind,
  poster,
  onTime,
  ref,
}: {
  url: string;
  kind: "audio" | "video";
  poster: { from: string; to: string };
  onTime?: (seconds: number) => void;
  ref?: React.Ref<PlayerHandle>;
}) {
  const el = useRef<HTMLMediaElement>(null);

  useImperativeHandle(ref, () => ({
    seek(seconds, play = false) {
      const media = el.current;
      if (!media) return;
      media.currentTime = Math.max(0, seconds);
      if (play) void media.play().catch(() => undefined);
    },
  }));

  if (kind === "video") {
    return (
      <div className="relative flex w-full justify-center bg-black max-h-[300px] sm:max-h-[340px] overflow-hidden">
        <video
          ref={el as React.RefObject<HTMLVideoElement>}
          src={url}
          controls
          playsInline
          preload="metadata"
          onTimeUpdate={(e) => onTime?.(e.currentTarget.currentTime)}
          className="max-h-[300px] sm:max-h-[340px] w-full object-contain"
          aria-label="Recording"
        />
      </div>
    );
  }

  return (
    <div
      className="flex h-32 sm:h-40 w-full flex-col justify-end p-4"
      style={{ backgroundImage: `linear-gradient(135deg, ${poster.from}, ${poster.to})` }}
    >
      <audio
        ref={el as React.RefObject<HTMLAudioElement>}
        src={url}
        controls
        preload="metadata"
        onTimeUpdate={(e) => onTime?.(e.currentTarget.currentTime)}
        className="w-full"
        aria-label="Recording"
      />
    </div>
  );
}
