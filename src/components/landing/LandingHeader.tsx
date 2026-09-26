import Link from "next/link";
import { Wordmark } from "@/components/brand/Logo";

/** The marketing page's header: wordmark left, a "Pricing" link and the "Open app" CTA right. No sign-in. */
export function LandingHeader() {
  return (
    <header className="border-b border-[#2B241C]/10 dark:border-[#F2EDDD]/10">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Wordmark />
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/pricing"
            className="text-sm font-medium text-[#2B241C]/70 hover:text-[#2B241C] dark:text-[#F2EDDD]/70 dark:hover:text-[#F2EDDD]"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-[#2B241C]/70 hover:text-[#2B241C] dark:text-[#F2EDDD]/70 dark:hover:text-[#F2EDDD]"
          >
            Log in
          </Link>
          <Link
            href="/calls"
            className="rounded-lg bg-[#0F6E56] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:bg-[#3EC79A] dark:text-[#101B33] dark:focus-visible:outline-[#3EC79A]"
          >
            Open app
          </Link>
        </div>
      </div>
    </header>
  );
}
