"use client";

import { useEffect, useRef, useState } from "react";

// Auth and accounts are out of scope for this build, so this is a static
// stand-in for the real account menu. It exists so the app shell looks right
// and so the public share view has something visible to leave out.
const DEMO_USER = { name: "Demo User", email: "demo@lumenapp.io" };

export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
      >
        DU
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-zinc-200 bg-white p-1 text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          <div className="px-3 py-2">
            <p className="font-medium">{DEMO_USER.name}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{DEMO_USER.email}</p>
          </div>
          <hr className="my-1 border-zinc-200 dark:border-zinc-700" />
          <button
            role="menuitem"
            disabled
            className="block w-full rounded px-3 py-2 text-left text-zinc-400"
          >
            Settings (not built)
          </button>
          <button
            role="menuitem"
            disabled
            className="block w-full rounded px-3 py-2 text-left text-zinc-400"
          >
            Sign out (no auth in this build)
          </button>
        </div>
      )}
    </div>
  );
}
