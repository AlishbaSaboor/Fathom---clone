"use client";

import { useImperativeHandle, useRef } from "react";

export interface PlayerHandle {
  /** Jump to a time in the recording, optionally starting playback. */
  seek: (seconds: number, play?: boolean) => void;
}

/**
 * Plays the stored recording straight from its URL, so seeking works and no
 * login is needed on the share page. Video gets a normal video player; audio
 * gets a gradient card with a native audio control bar.
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
  /** Called as playback advances (about 4 times a second). */
  onTime?: (seconds: number) => void;
  ref?: React.Ref<PlayerHandle>;
}) {
  const el = useRef<HTMLMediaElement>(null);

  useImperativeHandle(ref, () => ({
    seek(seconds, play = false) {
      const media = el.current;
      if (!media) return;
      media.currentTime = Math.max(0, seconds);
      if (play) void media.play().catch(() => undefined); // autoplay can be blocked; the user can press play
    },
  }));

  if (kind === "video") {
    return (
      <video
        ref={el as React.RefObject<HTMLVideoElement>}
        src={url}
        controls
        playsInline
        preload="metadata"
        onTimeUpdate={(e) => onTime?.(e.currentTarget.currentTime)}
        className="aspect-video w-full rounded-xl bg-black"
        aria-label="Recording"
      />
    );
  }

  return (
    <div
      className="flex aspect-video w-full flex-col justify-end rounded-xl p-4"
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
