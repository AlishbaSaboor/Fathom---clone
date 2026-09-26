import { SparkleIcon } from "@/components/ui/icons";

/**
 * The floating "Ask Fathom" trigger pill button.
 */
export function AskFathomButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-20 items-center gap-2 rounded-full bg-[#0F6E56] px-5 py-3 text-sm font-semibold text-white shadow-xl transition-all hover:scale-105 hover:bg-[#0c5945] dark:bg-[#3EC79A] dark:text-[#0B0F19] dark:hover:bg-[#35b58b] ${className}`}
    >
      <SparkleIcon className="h-4 w-4" />
      <span>Ask Fathom</span>
    </button>
  );
}
