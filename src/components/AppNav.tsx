"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Only "My Calls" is a fully working section. Team Calls, Playlists, Alerts and
// Deals are paid Fathom features and out of scope for this build, so each one
// is a real route that shows an upsell page (headline, feature bullets, a
// "Start 14-Day Trial" button), like the real product. The "not part of this
// build" message appears only when that page's main button is clicked. This
// second nav row shows on these five pages but not on a call's detail page,
// matching the real product.
const TABS = [
  { href: "/", label: "My Calls" },
  { href: "/team-calls", label: "Team Calls" },
  { href: "/playlists", label: "Playlists" },
  { href: "/alerts", label: "Alerts" },
  { href: "/deals", label: "Deals" },
] as const;

const tabBase =
  "-mb-px whitespace-nowrap border-b-2 px-2 py-3 text-[13px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600 sm:px-3 sm:text-sm";

export function AppNav() {
  const pathname = usePathname();
  if (!TABS.some((t) => t.href === pathname)) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Scrolls sideways on narrow screens. overflow-x: auto also makes the row scroll vertically, and the tabs'
          1px overhang (-mb-px, so the active underline sits on the header border) then produced a tiny native
          scrollbar with up/down arrows under the account icon. overflow-y-hidden removes it and leaves the
          pixels as they were (the overhanging row was always clipped). */}
      <nav aria-label="Primary" className="-mx-1 flex overflow-x-auto overflow-y-hidden px-1">
        {TABS.map((tab) => {
          const active = tab.href === pathname;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`${tabBase} ${
                active
                  ? "border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-300"
                  : "border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
