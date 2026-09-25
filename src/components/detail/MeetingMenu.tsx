"use client";

import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { DownloadIcon, MoreVerticalIcon, TrashIcon } from "@/components/ui/icons";

/** The "…" menu beside Share, for the owner: Download the recording, or Delete it (with its share link). */
export function MeetingMenu({ onDownload, onDelete }: { onDownload: () => void; onDelete: () => void }) {
  return (
    <DropdownMenu
      align="right"
      ariaLabel="More actions"
      menuClassName="w-56"
      triggerClassName="flex h-full w-10 shrink-0 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      triggerChildren={<MoreVerticalIcon className="h-4 w-4" />}
      items={[
        { id: "download", label: "Download Video", icon: <DownloadIcon className="h-4 w-4" />, onSelect: onDownload },
        { id: "delete", label: "Delete Call", icon: <TrashIcon className="h-4 w-4" />, danger: true, onSelect: onDelete },
      ]}
    />
  );
}
