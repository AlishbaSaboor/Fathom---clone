"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/AccountMenu";
import { Wordmark } from "@/components/brand/Logo";

const ACCOUNT_TRIGGER =
  "flex h-9 w-9 items-center justify-center rounded-full bg-[#2B241C] text-xs font-semibold text-[#F2EDDD] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:bg-[#F2EDDD] dark:text-[#101B33] dark:focus-visible:outline-[#3EC79A]";

const NAV_TABS = [
  { href: "/calls", label: "My Calls" },
  { href: "/team-calls", label: "Team Calls" },
  { href: "/playlists", label: "Playlists" },
  { href: "/alerts", label: "Alerts" },
  { href: "/deals", label: "Deals" },
] as const;

/**
 * The app shell's header (wordmark + account avatar), used identically by
 * every signed-in page. `showNav` adds the second row of tabs — My Calls plus
 * the four honest-stub premium pages — which only /calls and those four pages
 * show; the upload and meeting detail pages leave it off. `user` comes from the
 * layout's own server-side session read (see lib/server/auth.ts), so the header
 * never has to re-fetch it.
 */
export function AppHeader({ user, showNav = false }: { user: { email: string; name: string } | null; showNav?: boolean }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-[#2B241C]/10 bg-white/80 backdrop-blur dark:border-[#F2EDDD]/10 dark:bg-[#101B33]/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/calls">
          <Wordmark />
        </Link>
        <AccountMenu user={user} triggerClassName={ACCOUNT_TRIGGER} />
      </div>
      {showNav && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav aria-label="Primary" className="-mx-1 flex overflow-x-auto overflow-y-hidden px-1">
            {NAV_TABS.map((tab) => {
              const active = tab.href === pathname;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`-mb-px whitespace-nowrap border-b-2 px-2 py-3 text-[13px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0F6E56] sm:px-3 dark:focus-visible:outline-[#3EC79A] ${
                    active
                      ? "border-[#0F6E56] text-[#0F6E56] dark:border-[#3EC79A] dark:text-[#3EC79A]"
                      : "border-transparent text-[#2B241C]/60 hover:text-[#2B241C] dark:text-[#F2EDDD]/60 dark:hover:text-[#F2EDDD]"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
