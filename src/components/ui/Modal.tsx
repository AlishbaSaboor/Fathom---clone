"use client";

import { useEffect } from "react";
import { XIcon } from "./icons";

/**
 * A small centered dialog: overlay, Escape or backdrop-click to close, a
 * title row with its own close button. Used wherever a form needs to collect
 * input before an action (creating a playlist, picking recordings to add) —
 * there's no generic confirm dialog here, since plain destructive actions
 * still use `window.confirm`, matching the rest of the app.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Locks the page behind the overlay while it's open: without this, the page can still scroll (and jump/resize
  // as its own scrollbar appears or disappears) independently of the overlay's scroll, which is what made the
  // dialog look like it opened "wherever" rather than steadily in place.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    // The overlay itself scrolls (rather than using items-center alone on a fixed, viewport-height box): if the
    // panel is ever taller than the viewport, plain centering pushes its top off-screen with no way to reach it —
    // this way there's always a scrollbar that reveals the whole dialog, title included.
    <div className="fixed inset-0 z-40 overflow-y-auto bg-black/40" onClick={onClose}>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl border border-[#2B241C]/15 bg-white p-5 shadow-xl dark:border-[#F2EDDD]/15 dark:bg-[#101B33]"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded p-1 text-[#2B241C]/40 hover:text-[#2B241C] dark:text-[#F2EDDD]/40 dark:hover:text-[#F2EDDD]"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
