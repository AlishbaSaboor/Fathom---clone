"use client";

import { useState, useSyncExternalStore } from "react";
import { PanelRightIcon, SparkleIcon } from "@/components/ui/icons";
import type { MeetingListItem } from "@/types/meeting";
import { AskAllPanel } from "./AskAllPanel";
import { MeetingGrid } from "./MeetingGrid";

// Whether the visitor hid the Ask Fathom panel on desktop. A per-viewer
// convenience, so it lives in localStorage and the page works without it.
const HIDDEN_KEY = "fathom-clone:ask-panel-hidden";
const HIDDEN_EVENT = "fathom-ask-panel-changed";

function readHidden(): boolean {
  try {
    return localStorage.getItem(HIDDEN_KEY) === "1";
  } catch {
    return false;
  }
}
function setHidden(hidden: boolean) {
  try {
    localStorage.setItem(HIDDEN_KEY, hidden ? "1" : "0");
  } catch {
    // storage blocked: the panel just won't remember
  }
  window.dispatchEvent(new Event(HIDDEN_EVENT));
}
function subscribe(onChange: () => void) {
  window.addEventListener(HIDDEN_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(HIDDEN_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * My Calls: the call list with the account-level Ask Fathom panel beside it.
 * Desktop (lg and wider): the panel is part of the page from the start, a
 * full-height column against the right edge under the header, like the real
 * product. Its header icon hides it (remembered), leaving a slim rail with an
 * expand icon. Below lg there is no room for a column, so the same panel opens
 * as a full-screen overlay from the "Ask Fathom" button. The panel is always
 * mounted, so hiding it keeps the conversation.
 */

// Just under the app header: its 3.5rem row + the 1px border.
const BELOW_HEADER = "lg:top-[calc(3.5rem+1px)]";

export function MyCalls({ meetings }: { meetings: MeetingListItem[] }) {
  const hiddenDesktop = useSyncExternalStore(subscribe, readHidden, () => false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">My Calls.</h1>
        {/* Small screens only: on desktop the panel is already there. */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-[#2B241C]/20 px-3 py-2 text-sm font-medium hover:bg-[#2B241C]/5 lg:hidden dark:border-[#F2EDDD]/20 dark:hover:bg-[#F2EDDD]/10"
        >
          <SparkleIcon className="h-4 w-4 text-[#0F6E56] dark:text-[#3EC79A]" />
          Ask Fathom
        </button>
      </div>

      <MeetingGrid meetings={meetings} narrow={!hiddenDesktop} />

      <AskAllPanel
        meetings={meetings}
        onHideDesktop={() => setHidden(true)}
        onCloseMobile={() => setMobileOpen(false)}
        state={hiddenDesktop ? "hidden" : "open"}
        className={
          (mobileOpen ? "fixed inset-0 z-30 flex rounded-none " : "hidden ") +
          (hiddenDesktop
            ? "lg:hidden"
            : `lg:fixed lg:inset-auto lg:right-0 ${BELOW_HEADER} lg:bottom-0 lg:z-0 lg:flex lg:w-[340px] lg:rounded-none lg:border-y-0 lg:border-r-0`)
        }
      />

      {/* Hidden on desktop: a slim rail keeps the way back, as in the real product. */}
      {hiddenDesktop && (
        <div
          data-ask-panel="hidden"
          className={`fixed bottom-0 right-0 z-0 hidden w-10 justify-center border-l border-[#2B241C]/10 pt-3 lg:flex ${BELOW_HEADER} dark:border-[#F2EDDD]/10`}
        >
          <button
            type="button"
            onClick={() => setHidden(false)}
            aria-label="Show Ask Fathom"
            title="Show Ask Fathom"
            className="h-fit rounded p-1 text-[#2B241C]/60 hover:bg-[#2B241C]/5 hover:text-[#2B241C] dark:text-[#F2EDDD]/60 dark:hover:bg-[#F2EDDD]/10 dark:hover:text-[#F2EDDD]"
          >
            <PanelRightIcon className="h-4 w-4 -scale-x-100" />
          </button>
        </div>
      )}
    </>
  );
}
