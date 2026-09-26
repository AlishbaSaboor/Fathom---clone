import Link from "next/link";
import { Wordmark } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * The marketing header:
 * [Logo Fathom]   About Fathom   Features   Pricing   Contact us        [Theme Mode]   Log in   [Open app]
 */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#201D1A]/8 bg-[#FAF9F5]/90 backdrop-blur-md dark:border-white/10 dark:bg-[#0B0F19]/90">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-2.5 sm:px-6">
        
        {/* Left: Brand Logo & Links */}
        <div className="flex items-center gap-6 sm:gap-8">
          <Link href="/" className="shrink-0">
            <Wordmark />
          </Link>

          <nav className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-medium text-[#201D1A]/70 dark:text-[#F3F4F6]/70">
            <Link
              href="/"
              className="hover:text-[#201D1A] dark:hover:text-white transition-colors"
            >
              About Fathom
            </Link>
            <Link
              href="/features"
              className="hover:text-[#201D1A] dark:hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="hover:text-[#201D1A] dark:hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="hover:text-[#201D1A] dark:hover:text-white transition-colors"
            >
              Contact us
            </Link>
          </nav>
        </div>

        {/* Right: Theme Mode Switcher, Login, Open App */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <ThemeToggle />

          <Link
            href="/login"
            className="text-sm font-medium text-[#201D1A]/70 hover:text-[#201D1A] dark:text-[#F3F4F6]/70 dark:hover:text-white px-2 py-1.5 transition-colors"
          >
            Log in
          </Link>

          <Link
            href="/calls"
            className="rounded-lg bg-[#0F6E56] px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0c5945] dark:bg-[#3EC79A] dark:text-[#0B0F19] dark:hover:bg-[#35b58b]"
          >
            Open app
          </Link>
        </div>

      </div>
    </header>
  );
}
