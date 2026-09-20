"use client";

import { useState, useSyncExternalStore } from "react";
import { SparkleIcon } from "@/components/ui/icons";
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
 * Desktop: a sticky right-hand column that can be hidden (remembered). Below
 * the lg breakpoint there is no room for a column, so the same panel opens as a
 * full-screen overlay from the "Ask Fathom" button. The panel is always mounted,
 * so hiding it keeps the conversation.
 */
export function MyCalls({ meetings }: { meetings: MeetingListItem[] }) {
  const hiddenDesktop = useSyncExternalStore(subscribe, readHidden, () => false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">My Calls</h1>
        {/* Always offered on small screens; on desktop only once the panel has been hidden. */}
        <button
          type="button"
          onClick={() => {
            // Desktop: bring the column back. Below lg: open the overlay (leaving the remembered desktop choice alone).
            if (window.matchMedia("(min-width: 1024px)").matches) setHidden(false);
            else setMobileOpen(true);
          }}
          className={`inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800 ${
            hiddenDesktop ? "" : "lg:hidden"
          }`}
        >
          <SparkleIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          Ask Fathom
        </button>
      </div>

      <div className="lg:flex lg:items-start lg:gap-6">
        <div className="min-w-0 flex-1">
          <MeetingGrid meetings={meetings} narrow={!hiddenDesktop} />
        </div>
        <AskAllPanel
          meetings={meetings}
          onHideDesktop={() => setHidden(true)}
          onCloseMobile={() => setMobileOpen(false)}
          className={
            (mobileOpen ? "fixed inset-0 z-30 flex rounded-none " : "hidden ") +
            (hiddenDesktop
              ? "lg:hidden"
              : "lg:sticky lg:inset-auto lg:top-32 lg:z-auto lg:flex lg:h-[calc(100dvh-12.5rem)] lg:w-[340px] lg:shrink-0 lg:rounded-xl")
          }
        />
      </div>
    </>
  );
}
