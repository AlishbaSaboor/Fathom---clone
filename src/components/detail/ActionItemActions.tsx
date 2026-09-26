"use client";

import { DropdownMenu, type MenuItem } from "@/components/ui/DropdownMenu";
import { ChevronDownIcon, MailIcon } from "@/components/ui/icons";
import { DESTINATIONS, buildActionItemExport, buildFollowUpEmail, type ExportResult } from "@/lib/actionItemExport";
import { copyRich } from "@/lib/clipboard";
import type { Meeting } from "@/types/meeting";
import { DestinationIcon } from "./DestinationIcons";

const button =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#0F6E56]/20 bg-[#0F6E56]/8 px-3 py-2 text-xs font-semibold text-[#0F6E56] shadow-2xs transition hover:bg-[#0F6E56]/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:border-[#3EC79A]/25 dark:bg-[#3EC79A]/10 dark:text-[#3EC79A] dark:hover:bg-[#3EC79A]/20 dark:focus-visible:outline-[#3EC79A]";

/**
 * "Copy for…" (Asana, Google Docs, Gmail, Todoist, Word) and "Copy Follow-up Email".
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
    <div className="flex flex-wrap items-center gap-2">
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
        className={`${button} whitespace-nowrap`}
      >
        <span>Copy Follow-up Email</span>
        <MailIcon className="h-3.5 w-3.5 shrink-0" />
      </button>
    </div>
  );
}
