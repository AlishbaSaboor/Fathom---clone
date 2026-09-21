"use client";

import { DropdownMenu, type MenuItem } from "@/components/ui/DropdownMenu";
import { ChevronDownIcon, MailIcon } from "@/components/ui/icons";
import { DESTINATIONS, buildActionItemExport, buildFollowUpEmail, type ExportResult } from "@/lib/actionItemExport";
import { copyRich } from "@/lib/clipboard";
import type { Meeting } from "@/types/meeting";
import { DestinationIcon } from "./DestinationIcons";

const button =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-200 dark:hover:bg-blue-900/60";

/**
 * "Copy for…" and "Copy Follow-up Email". Nothing is sent anywhere: each option
 * builds text formatted for that tool (see lib/actionItemExport.ts) and copies
 * it to the clipboard, then confirms with a message naming the destination.
 */
export function ActionItemActions({
  meeting,
  done,
  onNotify,
}: {
  meeting: Meeting;
  done: Record<string, boolean>;
  onNotify: (text: string, kind?: "success" | "error") => void;
}) {
  async function copy(result: ExportResult, successMessage: string) {
    if (result.emptyReason) return onNotify(result.emptyReason, "error");
    const ok = await copyRich(result.plain, result.html);
    if (ok) onNotify(successMessage);
    else onNotify("Couldn't copy. Your browser blocked clipboard access.", "error");
  }

  const items: MenuItem[] = DESTINATIONS.map((d) => ({
    id: d.id,
    label: d.label,
    icon: <DestinationIcon id={d.id} />,
    onSelect: () => void copy(buildActionItemExport(d.id, meeting, done), `Copied for ${d.label}`),
  }));

  return (
    <div className="flex gap-2">
      <DropdownMenu
        items={items}
        ariaLabel="Copy action items for…"
        triggerClassName={`${button} shrink-0`}
        triggerChildren={
          <>
            Copy for
            <ChevronDownIcon className="h-3.5 w-3.5" />
          </>
        }
      />
      <button
        type="button"
        onClick={() => void copy(buildFollowUpEmail(meeting, done), "Copied follow-up email")}
        className={`${button} min-w-0 flex-1 whitespace-nowrap`}
      >
        <span className="truncate">Copy Follow-up Email</span>
        <MailIcon className="h-3.5 w-3.5 shrink-0" />
      </button>
    </div>
  );
}
