"use client";

import { XIcon } from "@/components/ui/icons";
import type { Meeting } from "@/types/meeting";
import { AskFathomTab } from "./AskFathomTab";

/**
 * The floating Ask Fathom chat, wrapping AskFathomTab's chat logic with the
 * panel chrome: an "online" dot, which call it's scoped to, and a close
 * button. Positioning (the slide-in, the gap below the header, the push on
 * the rest of the page) is handled by the caller via `className`.
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
      className={`flex flex-col rounded-xl border border-[#2B241C]/15 bg-white shadow-xl dark:border-[#F2EDDD]/15 dark:bg-[#101B33] ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-[#2B241C]/10 px-4 py-3 dark:border-[#F2EDDD]/10">
        <span
          aria-hidden
          title="Online"
          className="h-2 w-2 shrink-0 rounded-full bg-[#0F6E56] dark:bg-[#3EC79A]"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">Ask Fathom</h2>
          <p className="truncate text-xs text-[#2B241C]/60 dark:text-[#F2EDDD]/60">Scoped to: {meeting.title}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Ask Fathom"
          className="rounded p-1 text-[#2B241C]/60 hover:bg-[#2B241C]/5 hover:text-[#2B241C] dark:text-[#F2EDDD]/60 dark:hover:bg-[#F2EDDD]/10 dark:hover:text-[#F2EDDD]"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>
      <AskFathomTab meeting={meeting} onJump={onJump} />
    </aside>
  );
}
