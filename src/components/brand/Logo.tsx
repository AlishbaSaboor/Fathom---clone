"use client";

import { useId } from "react";

/**
 * Fathom AI Brand Mark:
 * A precision squircle emblem combining the letter "F", audio frequency bars,
 * and a glowing 4-point AI intelligence star. Perfectly optical-centered and
 * high contrast in both light and dark mode.
 */
export function LogoMark({ className = "h-7 w-7" }: { className?: string; barClassName?: string }) {
  const reactId = useId();
  const gradId = `fathom-grad-${reactId.replace(/:/g, "")}`;

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F6E56" className="[stop-color:#0F6E56] dark:[stop-color:#128A6B]" />
          <stop offset="100%" stopColor="#074433" className="[stop-color:#074433] dark:[stop-color:#095741]" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${gradId})`} />
      {/* "F" letterform & sound frequency bars */}
      <rect x="7.5" y="7.5" width="3.5" height="17" rx="1.75" fill="white" />
      <rect x="7.5" y="7.5" width="16.5" height="3.5" rx="1.75" fill="white" />
      <rect x="7.5" y="14" width="11.5" height="3.5" rx="1.75" fill="white" />
      {/* AI intelligence sparkle */}
      <path
        d="M21.5 17.5c0 2-1.5 3.5-3.5 3.5 2 0 3.5 1.5 3.5 3.5 0-2 1.5-3.5 3.5-3.5-2 0-3.5-1.5-3.5-3.5z"
        fill="#8EF0CF"
      />
    </svg>
  );
}

/** Full brand mark with typography. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-[17px] leading-none tracking-tight ${className}`}>
      <LogoMark className="h-7 w-7" />
      <span className="inline-flex items-baseline">
        <span className="font-bold text-[#1C1917] dark:text-[#FAF9F5]">Fathom</span>
        <span className="ml-1 font-semibold text-[#0F6E56] dark:text-[#3EC79A]">AI</span>
      </span>
    </span>
  );
}

/** Wordmark used across header, footer, auth, and shared pages. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-[17px] leading-none tracking-tight ${className}`}>
      <LogoMark className="h-7 w-7" />
      <span className="inline-flex items-baseline">
        <span className="font-bold text-[#1C1917] dark:text-[#FAF9F5]">Fathom</span>
        <span className="ml-1 font-semibold text-[#0F6E56] dark:text-[#3EC79A]">AI</span>
      </span>
    </span>
  );
}

