"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/AccountMenu";
import { Wordmark } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

const ACCOUNT_TRIGGER =
  "flex h-8 w-8 items-center justify-center rounded-full bg-[#0F6E56]/10 text-xs font-bold text-[#0F6E56] border border-[#0F6E56]/25 hover:bg-[#0F6E56]/20 transition-colors dark:bg-[#3EC79A]/20 dark:text-[#3EC79A] dark:border-[#3EC79A]/30 dark:hover:bg-[#3EC79A]/30 focus-visible:outline-2 focus-visible:outline-[#0F6E56] dark:focus-visible:outline-[#3EC79A]";

interface NavTab {
  href: string;
  label: string;
  badge?: string;
}

const NAV_TABS: NavTab[] = [
  { href: "/calls", label: "My Calls" },
  { href: "/team-calls", label: "Team Calls", badge: "PRO" },
  { href: "/playlists", label: "Playlists" },
  { href: "/alerts", label: "Alerts", badge: "PLUS" },
  { href: "/deals", label: "Deals", badge: "PLUS" },
];

/**
 * The app shell's header:
 * - On meeting detail page (showNav=false): ONLY renders [Wordmark / Logo] on the left, and [ThemeToggle] + [AccountMenu] on the right.
 * - On /calls and premium stubs (showNav=true): also adds the second row of navigation tabs.
 */
export function AppHeader({ user, showNav = false }: { user: { email: string; name: string } | null; showNav?: boolean }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-[#201D1A]/8 bg-[#FAF9F5]/90 backdrop-blur-md dark:border-white/10 dark:bg-[#0B0F19]/90">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/calls" className="shrink-0">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />
          <AccountMenu user={user} triggerClassName={ACCOUNT_TRIGGER} />
        </div>
      </div>
      {showNav && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav aria-label="Primary" className="-mx-1 flex overflow-x-auto overflow-y-hidden px-1 border-t border-[#201D1A]/5 dark:border-white/5">
            {NAV_TABS.map((tab) => {
              const active = tab.href === pathname;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`-mb-px inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-2.5 py-3 text-[13px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0F6E56] sm:px-3.5 dark:focus-visible:outline-[#3EC79A] ${
                    active
                      ? "border-[#0F6E56] text-[#0F6E56] dark:border-[#3EC79A] dark:text-[#3EC79A]"
                      : "border-transparent text-[#201D1A]/60 hover:text-[#201D1A] dark:text-[#F3F4F6]/60 dark:hover:text-[#F3F4F6]"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9.5px] font-bold tracking-wider uppercase ${
                        active
                          ? "bg-[#0F6E56]/10 text-[#0F6E56] dark:bg-[#3EC79A]/20 dark:text-[#3EC79A]"
                          : "bg-[#201D1A]/5 text-[#201D1A]/50 dark:bg-white/10 dark:text-[#F3F4F6]/50"
                      }`}
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="inline-block"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      {tab.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
