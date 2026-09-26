"use client";

import { useEffect, useRef, useState } from "react";

export function VideoThumbnail({
  url,
  poster,
}: {
  url?: string;
  poster: { from: string; to: string };
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let active = true;

    const handleLoadedMetadata = () => {
      // Seek to 0.5s or middle of first second to capture a meaningful preview frame
      try {
        const target = Math.min(0.5, (video.duration || 1) * 0.1);
        video.currentTime = target;
      } catch {
        // Ignore seek error
      }
    };

    const handleSeeked = () => {
      if (active) setLoaded(true);
    };

    const handleLoadedData = () => {
      if (active && video.readyState >= 2) {
        setLoaded(true);
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("loadeddata", handleLoadedData);

    if (video.readyState >= 2) {
      setLoaded(true);
    }

    return () => {
      active = false;
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("loadeddata", handleLoadedData);
    };
  }, [url]);

  return (
    <div
      className="absolute inset-0 h-full w-full overflow-hidden bg-black/90"
      style={{ backgroundImage: `linear-gradient(135deg, ${poster.from}, ${poster.to})` }}
    >
      {url && (
        <video
          ref={videoRef}
          src={`${url}#t=0.5`}
          preload="metadata"
          muted
          playsInline
          aria-hidden="true"
          tabIndex={-1}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* Subtle overlay gradient to ensure play button and duration badge always have great contrast */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
    </div>
  );
}
