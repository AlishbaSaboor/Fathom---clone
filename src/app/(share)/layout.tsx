import { Logo } from "@/components/brand/Logo";
import { SignInButton } from "@/components/share/SignInButton";

// Layout for the public share view, modeled on the real share page's header:
// brand, a promo pill, and a Sign In button at the right instead of an account
// menu. It is a separate route group from (app), so it never renders the
// account menu. The brand and promo are deliberately not links: this build has
// no marketing site or sign-up flow, and "/" is the signed-in app.
export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* relative + z-30 so the Sign In note isn't painted over by the video below */}
      <header className="relative z-30 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Logo className="shrink-0" />
            <span className="hidden truncate rounded-md bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800 sm:inline-block dark:bg-amber-950/60 dark:text-amber-300">
              Get your own free AI Notetaker <span aria-hidden>🔥</span>
            </span>
          </div>
          <SignInButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
