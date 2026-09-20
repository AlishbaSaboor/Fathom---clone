import Link from "next/link";
import { AccountMenu } from "@/components/AccountMenu";
import { AppNav } from "@/components/AppNav";

// App shell for the signed-in experience: header, account menu and the My
// Calls / Team Calls / Playlists / Alerts / Deals nav row. The public
// share route lives in the (share) group and deliberately does not use this
// layout, so it never renders an account menu.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600 text-sm text-white">
              F
            </span>
            Fathom Clone
          </Link>
          <AccountMenu />
        </div>
        <AppNav />
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
