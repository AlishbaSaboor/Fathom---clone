import Link from "next/link";
import { AccountMenu } from "@/components/AccountMenu";
import { Logo } from "@/components/brand/Logo";

// App shell: header and account menu. The public share route lives in the
// (share) group and deliberately does not use this layout, so it never renders
// an account menu.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/">
            <Logo />
          </Link>
          <AccountMenu />
        </div>
      </header>
      {/* My Calls has a fixed right-hand Ask Fathom column (or a slim rail when hidden). It says which through a
          data attribute; the page reads it here to reserve room, so the shell stays a server component. The
          content keeps its left edge in line with the header and only gives up as much on the right as the
          column needs: none on a wide window, where the centred content already stops short of it. */}
      <div className="lg:has-[[data-ask-panel=open]]:[--ask-w:340px] lg:has-[[data-ask-panel=hidden]]:[--ask-w:2.5rem]">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:pr-[calc(1.5rem+max(0px,var(--ask-w,0px)-max(0px,(100%-72rem)/2)))]">
          {children}
        </main>
      </div>
    </div>
  );
}
