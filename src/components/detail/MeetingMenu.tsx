"use client";

import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { DownloadIcon, MoreVerticalIcon, TrashIcon } from "@/components/ui/icons";
import type { Meeting } from "@/types/meeting";

/**
 * The "…" menu beside Share: Download Video and Delete Call.
 *  - Uploaded recordings: Download saves the real file kept in IndexedDB, and
 *    Delete removes the meeting and the file (the same logic as the card's
 *    delete button).
 *  - Seeded demo meetings have no recording and can't be deleted, so Download
 *    is disabled with a reason, and Delete explains that it isn't available.
 */
export function MeetingMenu({
  meeting,
  onDownload,
  onDelete,
  onNotify,
}: {
  meeting: Meeting;
  /** Provided only when the recording file is actually available to download. */
  onDownload?: () => void;
  onDelete?: () => void;
  onNotify: (text: string, kind?: "success" | "error") => void;
}) {
  const uploaded = meeting.source === "upload";

  return (
    <DropdownMenu
      align="right"
      ariaLabel="More actions"
      menuClassName="w-56"
      triggerClassName="flex h-full w-10 shrink-0 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      triggerChildren={<MoreVerticalIcon className="h-4 w-4" />}
      items={[
        {
          id: "download",
          label: "Download Video",
          icon: <DownloadIcon className="h-4 w-4" />,
          disabled: !onDownload,
          hint: uploaded ? "The recording isn't stored in this browser" : "Demo meetings have no recording",
          onSelect: () => onDownload?.(),
        },
        {
          id: "delete",
          label: "Delete Call",
          icon: <TrashIcon className="h-4 w-4" />,
          danger: true,
          onSelect: () => {
            if (uploaded && onDelete) onDelete();
            else onNotify("Delete isn't available for demo meetings.", "error");
          },
        },
      ]}
    />
  );
}
