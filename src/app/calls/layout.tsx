import { AppHeader } from "@/components/AppHeader";
import { getUser } from "@/lib/server/auth";

/**
 * The shell for My Calls: the shared app header with nav tabs, in the
 * warm alabaster & obsidian palette.
 */
export default async function CallsLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#201D1A] dark:bg-[#0B0F19] dark:text-[#F3F4F6]">
      <AppHeader user={user} showNav />
      {/* Reserves room on the right for the fixed Ask Fathom column when it's open */}
      <div className="lg:has-[[data-ask-panel=open]]:[--ask-w:340px]">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:pr-[calc(1.5rem+max(0px,var(--ask-w,0px)-max(0px,(100%-72rem)/2)))]">
          {children}
        </main>
      </div>
    </div>
  );
}
