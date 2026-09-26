import { AppHeader } from "@/components/AppHeader";
import { getUser } from "@/lib/server/auth";

/**
 * The shell for the meeting detail page.
 * Uses the warm alabaster / obsidian palette.
 * The header only displays Fathom's name & logo, the theme mode, and the profile avatar.
 */
export default async function MeetingLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#201D1A] dark:bg-[#0B0F19] dark:text-[#F3F4F6]">
      <AppHeader user={user} showNav={false} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
