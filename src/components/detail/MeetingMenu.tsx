"use client";

import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { DownloadIcon, MoreVerticalIcon, TrashIcon } from "@/components/ui/icons";

/** The "…" menu beside Share: download transcript, download recording, or delete the call. */
export function MeetingMenu({
  onDownload,
  onDownloadTranscript,
  onDelete,
}: {
  onDownload: () => void;
  onDownloadTranscript: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu
      align="right"
      ariaLabel="More actions"
      menuClassName="w-56"
      triggerClassName="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#201D1A]/10 bg-white text-[#201D1A]/70 shadow-xs transition hover:bg-[#201D1A]/5 focus-visible:outline-2 focus-visible:outline-[#0F6E56] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#F3F4F6]/70 dark:hover:bg-white/[0.08] dark:focus-visible:outline-[#3EC79A]"
      triggerChildren={<MoreVerticalIcon className="h-4 w-4" />}
      items={[
        {
          id: "transcript",
          label: "Download transcript (.txt)",
          icon: <DownloadIcon className="h-4 w-4" />,
          onSelect: onDownloadTranscript,
        },
        { id: "download", label: "Download Video", icon: <DownloadIcon className="h-4 w-4" />, onSelect: onDownload },
        { id: "delete", label: "Delete Call", icon: <TrashIcon className="h-4 w-4" />, danger: true, onSelect: onDelete },
      ]}
    />
  );
}
