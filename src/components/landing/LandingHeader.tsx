"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavItem {
  href: string;
  label: string;
  isActive: (path: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "About Fathom", isActive: (path) => path === "/" },
  { href: "/features", label: "Features", isActive: (path) => path.startsWith("/features") },
  { href: "/pricing", label: "Pricing", isActive: (path) => path.startsWith("/pricing") },
  { href: "/contact", label: "Contact us", isActive: (path) => path.startsWith("/contact") },
];

/**
 * The marketing header:
 * [Logo Fathom]   About Fathom   Features   Pricing   Contact us        [Theme Mode]   Log in   [Open app]
 */
export function LandingHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[#201D1A]/8 bg-[#FAF9F5]/90 backdrop-blur-md dark:border-white/10 dark:bg-[#0B0F19]/90">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-2.5 sm:px-6">
        
        {/* Left: Brand Logo & Links */}
        <div className="flex items-center gap-6 sm:gap-8">
          <Link href="/" className="shrink-0">
            <Wordmark />
          </Link>

          <nav className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-medium text-[#201D1A]/70 dark:text-[#F3F4F6]/70">
            {NAV_ITEMS.map((item) => {
              const active = item.isActive(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`transition-colors py-1 ${
                    active
                      ? "font-semibold text-[#0F6E56] dark:text-[#3EC79A] underline decoration-2 underline-offset-[6px] decoration-[#0F6E56] dark:decoration-[#3EC79A]"
                      : "hover:text-[#201D1A] dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
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
