"use client";

import { XIcon } from "@/components/ui/icons";
import type { Meeting } from "@/types/meeting";
import { AskFathomTab } from "./AskFathomTab";

/**
 * The floating Ask Fathom chat panel.
 * Scoped to this call's transcript.
 */
export function AskFathomPanel({
  meeting,
  onJump,
  onClose,
  className,
}: {
  meeting: Meeting;
  onJump: (t: number) => void;
  onClose: () => void;
  className: string;
}) {
  return (
    <aside
      aria-label="Ask Fathom"
      className={`flex flex-col rounded-2xl border border-[#201D1A]/10 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111827] overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-[#201D1A]/8 bg-[#FAF9F5]/80 px-4 py-3 dark:border-white/10 dark:bg-[#0B0F19]/50 backdrop-blur">
        <span
          aria-hidden
          title="Online"
          className="h-2 w-2 shrink-0 rounded-full bg-[#0F6E56] dark:bg-[#3EC79A] animate-pulse"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-xs font-bold text-[#201D1A] dark:text-[#F3F4F6]">Ask Fathom</h2>
            <span className="rounded bg-[#0F6E56]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#0F6E56] dark:bg-[#3EC79A]/20 dark:text-[#3EC79A]">
              AI
            </span>
          </div>
          <p className="truncate text-[11px] text-[#201D1A]/60 dark:text-[#F3F4F6]/60">Scoped to: {meeting.title}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Ask Fathom"
          className="rounded p-1 text-[#201D1A]/60 hover:bg-[#201D1A]/5 hover:text-[#201D1A] dark:text-[#F3F4F6]/60 dark:hover:bg-white/5 dark:hover:text-white"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
      <AskFathomTab meeting={meeting} onJump={onJump} />
    </aside>
  );
}
