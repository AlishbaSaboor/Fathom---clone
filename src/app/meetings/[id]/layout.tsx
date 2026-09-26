import { AppHeader } from "@/components/AppHeader";
import { getUser } from "@/lib/server/auth";

/**
 * The shell for the meeting detail page, in the app's charcoal/cream/emerald
 * palette (see components/landing for where it started, and app/calls or
 * app/upload for the identical treatment there). Deliberately no Share button
 * here: Share lives once, next to the title, not duplicated in the header. No
 * nav row either: only /calls and the four premium stub pages show it.
 */
export default async function MeetingLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  return (
    <div className="min-h-screen bg-white text-[#2B241C] dark:bg-[#101B33] dark:text-[#F2EDDD]">
      <AppHeader user={user} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
