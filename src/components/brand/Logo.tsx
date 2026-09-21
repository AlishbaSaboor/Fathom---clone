// The app's own mark: a speech bubble (the conversation) holding three sound
// bars (the recording). Drawn as plain geometry so it stays readable from a
// 16px favicon up. The same shapes are in src/app/icon.svg, which needs literal
// colors because a favicon has no page around it to inherit from.

/** The bubble-and-bars mark. Takes its blue from `className` (currentColor); the bars are always white. */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={`shrink-0 ${className}`}>
      <path
        fill="currentColor"
        d="M9 2h14a7 7 0 0 1 7 7v9a7 7 0 0 1-7 7H14l-7 6v-6H9a7 7 0 0 1-7-7V9a7 7 0 0 1 7-7z"
      />
      <rect x="7" y="9" width="4" height="9" rx="2" fill="#fff" />
      <rect x="14" y="5.5" width="4" height="16" rx="2" fill="#fff" />
      <rect x="21" y="8" width="4" height="11" rx="2" fill="#fff" />
    </svg>
  );
}

/** Mark plus the "Fathom Clone" wordmark (Inter, the app's font). Used by both the app and share headers. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[17px] leading-none tracking-tight ${className}`}>
      <LogoMark className="h-7 w-7 text-blue-600 dark:text-blue-500" />
      <span>
        <span className="font-bold">Fathom</span> <span className="font-medium text-blue-600 dark:text-blue-400">Clone</span>
      </span>
    </span>
  );
}
