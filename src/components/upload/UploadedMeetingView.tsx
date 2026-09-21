"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MeetingDetail, type MediaSource } from "@/components/detail/MeetingDetail";
import { deleteUpload, getMedia, useHydrated, useUploads } from "@/lib/recordings/storage";

type MediaState = { id: string; source: MediaSource | "loading" };

/**
 * Loads the recording's bytes from IndexedDB as an object URL for the player.
 * State is keyed by id so switching meetings never shows the previous file.
 */
function useRecording(id: string, mimeType: string | undefined, enabled: boolean): MediaSource | "loading" {
  const [state, setState] = useState<MediaState>({ id, source: "loading" });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let url: string | undefined;
    getMedia(id)
      .then((blob) => {
        if (cancelled) return;
        if (!blob) return setState({ id, source: { kind: "unavailable" } });
        url = URL.createObjectURL(blob);
        const kind = (blob.type || mimeType || "").startsWith("video/") ? "video" : "audio";
        setState({ id, source: { kind, url } });
      })
      .catch(() => !cancelled && setState({ id, source: { kind: "unavailable" } }));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id, mimeType, enabled]);

  return state.id === id ? state.source : "loading";
}

export function UploadedMeetingView({ id }: { id: string }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const meeting = useUploads().find((m) => m.id === id);
  const media = useRecording(id, meeting?.media?.mimeType, hydrated && !!meeting);

  if (!hydrated || (meeting && media === "loading")) {
    return <div className="h-96 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" aria-label="Loading recording" />;
  }

  if (!meeting) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
        <h1 className="text-lg font-semibold">Recording not found</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Uploaded recordings are stored only in the browser they were uploaded from, so this one isn&rsquo;t available
          here. It may have been deleted, or it was uploaded on another device or browser.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="/" className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">
            Back to My Calls
          </Link>
          <Link href="/upload" className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
            Upload a recording
          </Link>
        </div>
      </div>
    );
  }

  // Saves the real recording from IndexedDB under its original file name.
  async function download() {
    const blob = await getMedia(id).catch(() => undefined);
    if (!blob) {
      window.alert("The recording couldn't be read from this browser's storage.");
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = meeting!.media?.fileName ?? `${meeting!.title}.${blob.type.split("/")[1] || "bin"}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  async function remove() {
    if (!window.confirm(`Delete "${meeting!.title}"? The recording and its transcript are removed from this browser and can't be recovered.`)) return;
    await deleteUpload(id);
    router.replace("/");
  }

  return (
    <>
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <span aria-hidden>←</span> My Calls
      </Link>
      <MeetingDetail
        meeting={meeting}
        media={media as MediaSource}
        onDelete={remove}
        onDownload={media !== "loading" && media.kind !== "unavailable" ? download : undefined}
      />
    </>
  );
}
