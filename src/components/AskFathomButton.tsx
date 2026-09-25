import { SparkleIcon } from "@/components/ui/icons";

/**
 * The floating "Ask Fathom" trigger: a labeled pill, not a bare icon, so what
 * it opens is clear at a glance rather than something to hover and discover.
 * Used identically on My Calls and the meeting detail page — the caller only
 * supplies `onClick` and, via `className`, when it should show (each page has
 * its own rules for that, since My Calls also has a persistent desktop column).
 */
export function AskFathomButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-20 items-center gap-2 rounded-full bg-[#0F6E56] px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 dark:bg-[#3EC79A] dark:text-[#101B33] ${className}`}
    >
      <SparkleIcon className="h-5 w-5" />
      Ask Fathom
    </button>
  );
}
