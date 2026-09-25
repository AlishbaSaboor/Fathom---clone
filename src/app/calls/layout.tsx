import Link from "next/link";
import { AccountMenu } from "@/components/AccountMenu";
import { Wordmark } from "@/components/brand/Logo";

const ACCOUNT_TRIGGER =
  "flex h-9 w-9 items-center justify-center rounded-full bg-[#2B241C] text-xs font-semibold text-[#F2EDDD] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:bg-[#F2EDDD] dark:text-[#101B33] dark:focus-visible:outline-[#3EC79A]";

/**
 * The shell for My Calls: header (wordmark + account avatar) in the app's
 * charcoal/cream/emerald palette (see components/landing for where it
 * started). Upload and the meeting detail page haven't been redesigned yet and
 * keep the older shared (app) shell/palette, so this page gets its own layout
 * rather than sharing theirs — the same reasoning as the marketing page.
 */
export default function CallsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-[#2B241C] dark:bg-[#101B33] dark:text-[#F2EDDD]">
      <header className="sticky top-0 z-10 border-b border-[#2B241C]/10 bg-white/80 backdrop-blur dark:border-[#F2EDDD]/10 dark:bg-[#101B33]/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/calls">
            <Wordmark />
          </Link>
          <AccountMenu triggerClassName={ACCOUNT_TRIGGER} />
        </div>
      </header>
      {/* Reserves room on the right for the fixed Ask Fathom column (or its slim collapsed rail); see MyCalls.tsx. */}
      <div className="lg:has-[[data-ask-panel=open]]:[--ask-w:340px] lg:has-[[data-ask-panel=hidden]]:[--ask-w:2.5rem]">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:pr-[calc(1.5rem+max(0px,var(--ask-w,0px)-max(0px,(100%-72rem)/2)))]">
          {children}
        </main>
      </div>
    </div>
  );
}
