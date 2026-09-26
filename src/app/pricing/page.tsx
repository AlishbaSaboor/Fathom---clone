import type { Metadata } from "next";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { PricingCards } from "@/components/pricing/PricingCards";
import { getUser } from "@/lib/server/auth";

export const metadata: Metadata = {
  title: "Pricing | Fathom AI",
  description: "Free, Pro and Plus plans. Start free with real transcripts, summaries and shareable links.",
};

/**
 * The pricing page: reachable from the landing page (logged out) and from the
 * account menu (inside the app). Uses consistent warm alabaster & obsidian styling.
 */
export default async function PricingPage() {
  const user = await getUser();

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F5] text-[#201D1A] dark:bg-[#0B0F19] dark:text-[#F3F4F6]">
      <LandingHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 pb-4 pt-16 text-center sm:px-6 sm:pt-24">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Pricing.</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#201D1A]/70 dark:text-[#F3F4F6]/70">
            Start free. Upgrade when your team needs more.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <PricingCards loggedIn={!!user} />
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
