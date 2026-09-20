"use client";

import { useEffect, useRef, useState } from "react";

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  /** Disabled items are shown but can't be chosen; `hint` says why. */
  disabled?: boolean;
  hint?: string;
  danger?: boolean;
}

/**
 * A small accessible menu button: opens on click, closes on Escape, outside
 * click or choosing an item, arrow keys move between items, focus returns to
 * the trigger.
 */
export function DropdownMenu({
  items,
  ariaLabel,
  triggerClassName,
  triggerChildren,
  align = "left",
  menuClassName = "w-52",
}: {
  items: MenuItem[];
  ariaLabel: string;
  triggerClassName: string;
  triggerChildren: React.ReactNode;
  align?: "left" | "right";
  menuClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function enabledItems(): HTMLElement[] {
    return Array.from(root.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? []);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      trigger.current?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const els = enabledItems();
      if (!els.length) return;
      const i = els.findIndex((el) => el === document.activeElement);
      els[(i + (e.key === "ArrowDown" ? 1 : -1) + els.length) % els.length].focus();
    }
  }

  function choose(item: MenuItem) {
    if (item.disabled) return;
    setOpen(false);
    trigger.current?.focus();
    item.onSelect();
  }

  return (
    <div ref={root} className="relative" onKeyDown={onKeyDown}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={triggerClassName}
      >
        {triggerChildren}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={ariaLabel}
          className={`absolute z-30 mt-2 overflow-hidden rounded-lg border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 ${
            align === "right" ? "right-0" : "left-0"
          } ${menuClassName}`}
        >
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              autoFocus={i === items.findIndex((x) => !x.disabled)}
              onClick={() => choose(item)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-zinc-100 focus-visible:bg-zinc-100 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:hover:bg-zinc-800 dark:focus-visible:bg-zinc-800 ${
                item.danger ? "text-rose-600 dark:text-rose-400" : ""
              }`}
            >
              {item.icon && <span className="flex h-5 w-5 shrink-0 items-center justify-center">{item.icon}</span>}
              <span className="min-w-0 flex-1">
                <span className="block">{item.label}</span>
                {item.disabled && item.hint && (
                  <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">{item.hint}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
