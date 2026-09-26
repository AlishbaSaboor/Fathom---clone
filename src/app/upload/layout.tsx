import { AppHeader } from "@/components/AppHeader";
import { getUser } from "@/lib/server/auth";

/**
 * The shell for the upload page, in the app's charcoal/cream/emerald palette
 * (see components/landing for where it started, and app/calls/layout.tsx for
 * the identical treatment there). No nav row here: only /calls and the four
 * premium stub pages show it.
 */
export default async function UploadLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  return (
    <div className="min-h-screen bg-white text-[#2B241C] dark:bg-[#101B33] dark:text-[#F2EDDD]">
      <AppHeader user={user} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
