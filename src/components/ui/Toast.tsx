"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertIcon, CheckIcon } from "./icons";

type ToastKind = "success" | "error" | "info";

/**
 * A brief top-right confirmation, like the "Copied" chip in the real product.
 * Usage: const { show, toast } = useToast(); render {toast} once, call show("Copied for Gmail").
 */
export function useToast(durationMs = 2600) {
  const [state, setState] = useState<{ text: string; kind: ToastKind; id: number } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const show = useCallback(
    (text: string, kind: ToastKind = "success") => {
      window.clearTimeout(timer.current);
      setState({ text, kind, id: Date.now() });
      timer.current = window.setTimeout(() => setState(null), durationMs);
    },
    [durationMs],
  );

  const toast = state ? (
    <div
      key={state.id}
      role="status"
      className={`fixed right-4 top-20 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white shadow-lg ${
        state.kind === "success"
          ? "bg-emerald-600"
          : state.kind === "error"
            ? "bg-rose-600"
            : "bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
      }`}
    >
      {state.kind === "success" && <CheckIcon className="h-4 w-4 shrink-0" />}
      {state.kind === "error" && <AlertIcon className="h-4 w-4 shrink-0" />}
      <span>{state.text}</span>
    </div>
  ) : null;

  return { show, toast };
}
