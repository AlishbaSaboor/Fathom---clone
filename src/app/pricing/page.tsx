import type { Metadata } from "next";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { PricingCards } from "@/components/pricing/PricingCards";

export const metadata: Metadata = {
  title: "Pricing | Fathom Clone",
  description: "Free, Pro and Plus plans. Start free with real transcripts, summaries and shareable links.",
};

/**
 * The pricing page: reachable from the landing page (logged out) and from the
 * account menu (inside the app), so it uses the landing page's own neutral
 * header/footer rather than the app shell's — it isn't tied to being signed in.
 */
export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#2B241C] dark:bg-[#101B33] dark:text-[#F2EDDD]">
      <LandingHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 pb-4 pt-20 text-center sm:px-6 sm:pt-28">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Pricing.</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#2B241C]/70 dark:text-[#F2EDDD]/70">
            Start free. Upgrade when your team needs more.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <PricingCards />
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
