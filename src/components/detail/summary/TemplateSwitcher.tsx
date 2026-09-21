"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "@/components/ui/icons";
import { TEMPLATE_ORDER, TEMPLATES } from "@/data/templates";
import type { TemplateId } from "@/types/meeting";

export function TemplateSwitcher({
  value,
  onChange,
  available = TEMPLATE_ORDER,
}: {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
  /** Templates this meeting has a stored summary for. */
  available?: TemplateId[];
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

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      trigger.current?.focus();
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const options = Array.from(root.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);
    const i = options.findIndex((o) => o === document.activeElement);
    const next = e.key === "ArrowDown" ? i + 1 : i - 1;
    options[(next + options.length) % options.length]?.focus();
  }

  function choose(id: TemplateId) {
    onChange(id);
    setOpen(false);
    trigger.current?.focus();
  }

  return (
    <div ref={root} className="relative" onKeyDown={onListKeyDown}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Summary template: ${TEMPLATES[value].label}`}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
      >
        {TEMPLATES[value].label}
        <ChevronDownIcon className="h-3.5 w-3.5" />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Summary template"
          className="absolute left-0 z-20 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        >
          {available.map((id) => {
            const t = TEMPLATES[id];
            const selected = id === value;
            return (
              <li key={id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  autoFocus={selected}
                  onClick={() => choose(id)}
                  className="flex w-full items-start gap-3 rounded-md px-3 py-2 text-left hover:bg-zinc-100 focus-visible:bg-zinc-100 focus-visible:outline-none dark:hover:bg-zinc-800 dark:focus-visible:bg-zinc-800"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{t.label}</span>
                    <span className="block text-xs text-zinc-500 dark:text-zinc-400">{t.description}</span>
                  </span>
                  {selected && <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
