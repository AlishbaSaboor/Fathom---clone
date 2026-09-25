"use client";

import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { DownloadIcon, MoreVerticalIcon, TrashIcon } from "@/components/ui/icons";

/** The "…" menu beside Share, for the owner: download the transcript or the recording, or delete the call. */
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
      triggerClassName="flex h-full w-10 shrink-0 items-center justify-center rounded-md border border-[#2B241C]/20 bg-white text-[#2B241C]/70 hover:bg-[#2B241C]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:border-[#F2EDDD]/20 dark:bg-[#101B33] dark:text-[#F2EDDD]/70 dark:hover:bg-[#F2EDDD]/10 dark:focus-visible:outline-[#3EC79A]"
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
