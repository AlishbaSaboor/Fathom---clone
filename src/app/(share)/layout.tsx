import Link from "next/link";
import { Wordmark } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getUser } from "@/lib/server/auth";

// Layout for the public share view:
// Fathom AI brand, promo badge, theme mode switcher, and Sign in / Open App action.
export default async function ShareLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#201D1A] dark:bg-[#0B0F19] dark:text-[#F3F4F6] transition-colors">
      <header className="sticky top-0 z-40 border-b border-[#201D1A]/8 bg-[#FAF9F5]/90 backdrop-blur-md dark:border-white/10 dark:bg-[#0B0F19]/90">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link href="/" className="shrink-0">
              <Wordmark />
            </Link>
            <Link
              href="/"
              className="hidden truncate rounded-full border border-[#0F6E56]/20 bg-[#0F6E56]/10 px-3 py-1 text-xs font-semibold text-[#0F6E56] hover:bg-[#0F6E56]/15 transition sm:inline-block dark:border-[#3EC79A]/30 dark:bg-[#3EC79A]/15 dark:text-[#3EC79A] dark:hover:bg-[#3EC79A]/20"
            >
              Get your own free AI Notetaker <span aria-hidden>✨</span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <ThemeToggle />

            {user ? (
              <Link
                href="/calls"
                className="rounded-lg bg-[#0F6E56] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-[#0c5945] dark:bg-[#3EC79A] dark:text-[#0B0F19] dark:hover:bg-[#35b58b]"
              >
                Go to My Calls
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-medium text-[#201D1A]/70 hover:text-[#201D1A] dark:text-[#F3F4F6]/70 dark:hover:text-white px-2 py-1.5 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-[#0F6E56] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-[#0c5945] dark:bg-[#3EC79A] dark:text-[#0B0F19] dark:hover:bg-[#35b58b]"
                >
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
