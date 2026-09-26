"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "./icons";

export function CopyButton({
  getText,
  label,
  shortLabel,
  copiedLabel = "Copied",
  className = "",
}: {
  getText: () => string;
  label: string;
  shortLabel?: string;
  copiedLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-[#0F6E56]/20 bg-[#0F6E56]/8 px-2.5 py-1.5 text-xs font-semibold text-[#0F6E56] shadow-2xs transition hover:bg-[#0F6E56]/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:border-[#3EC79A]/25 dark:bg-[#3EC79A]/10 dark:text-[#3EC79A] dark:hover:bg-[#3EC79A]/20 dark:focus-visible:outline-[#3EC79A] ${className}`}
    >
      {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
      <span aria-live="polite" className="whitespace-nowrap">
        {copied ? (
          copiedLabel
        ) : shortLabel ? (
          <>
            <span className="sm:hidden">{shortLabel}</span>
            <span className="hidden sm:inline">{label}</span>
          </>
        ) : (
          label
        )}
      </span>
    </button>
  );
}
