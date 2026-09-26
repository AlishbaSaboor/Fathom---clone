import { AppHeader } from "@/components/AppHeader";
import { getUser } from "@/lib/server/auth";

/**
 * Shared shell for the four premium stub pages (Team Calls, Playlists,
 * Alerts, Deals): they're genuinely identical in shell, unlike /calls, /upload
 * and the meeting detail page, which each carry something of their own.
 * Not gated by proxy.ts like the real app pages are (there's no real data
 * behind them), but the header still shows who's signed in, since the nav tabs
 * that lead here only appear inside the signed-in app shell.
 */
export default async function PremiumLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  return (
    <div className="min-h-screen bg-white text-[#2B241C] dark:bg-[#101B33] dark:text-[#F2EDDD]">
      <AppHeader user={user} showNav />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
