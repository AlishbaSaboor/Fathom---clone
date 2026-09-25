"use client";

import { useRouter } from "next/navigation";
import type { ApiErrorBody } from "@/lib/recordings/types";
import type { Meeting } from "@/types/meeting";
import { MeetingDetail } from "./MeetingDetail";

/** The message from one of our API routes' error bodies, or a generic one. */
async function errorMessage(res: Response): Promise<string> {
  try {
    return ((await res.json()) as ApiErrorBody).error.message;
  } catch {
    return "Something went wrong. Please try again.";
  }
}

/**
 * The owner's page for one recording. It adds what only the owner may do to the
 * shared detail layout: download the file, delete the recording, and have the
 * action item checkboxes saved.
 */
export function OwnerMeetingView({ meeting }: { meeting: Meeting }) {
  const router = useRouter();

  // The file is served straight from its stored URL; "?download=1" asks the store to send it as a download.
  function download() {
    if (!meeting.media) return;
    const link = document.createElement("a");
    link.href = `${meeting.media.url}?download=1`;
    link.download = meeting.media.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function remove() {
    if (!window.confirm(`Delete "${meeting.title}"? The recording, its transcript and its share link are permanently removed and can't be recovered.`)) return;
    try {
      const res = await fetch(`/api/meetings/${meeting.id}`, { method: "DELETE" });
      if (!res.ok) return void window.alert(await errorMessage(res));
    } catch {
      return void window.alert("Couldn't reach the server. Check your connection and try again.");
    }
    router.replace("/calls");
    router.refresh();
  }

  async function saveActionItem(itemId: string, done: boolean): Promise<boolean> {
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/action-items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  return <MeetingDetail meeting={meeting} onDelete={remove} onDownload={download} onToggleAction={saveActionItem} />;
}
