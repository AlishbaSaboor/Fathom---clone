import type { Metadata } from "next";
import Link from "next/link";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";

export const metadata: Metadata = {
  title: "Fathom Clone — AI Meeting Notetaker",
  description:
    "Real transcripts, summaries and action items from your recordings, an AI chatbot that answers from your actual meeting data, and instant shareable links.",
};

const FEATURES = [
  {
    title: "Transcripts, summaries & action items",
    description: "Real transcripts, summaries, and action items generated from an uploaded recording.",
  },
  {
    title: "Ask Fathom",
    description: "An AI chatbot that answers questions using your actual meeting data.",
  },
  {
    title: "Instant shareable links",
    description: "Every recording gets a shareable link. No login required to view it.",
  },
];

/**
 * The marketing landing page at "/": header, hero and three feature cards,
 * footer. Fully static (no cookies, no data reads), so it's prerendered at
 * build time. Its charcoal/cream/emerald palette is deliberately its own,
 * distinct from the app's blue/zinc theme; My Calls and everything else in the
 * app are unaffected and now live at /calls onward.
 */
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#2B241C] dark:bg-[#101B33] dark:text-[#F2EDDD]">
      <LandingHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
          <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
            Understand every meeting, automatically.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[#2B241C]/70 dark:text-[#F2EDDD]/70">
            Real transcripts, summaries, and action items generated automatically from your recordings.
          </p>
          <Link
            href="/calls"
            className="mt-8 inline-block rounded-lg bg-[#0F6E56] px-6 py-3 text-base font-semibold text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:bg-[#3EC79A] dark:text-[#101B33] dark:focus-visible:outline-[#3EC79A]"
          >
            Open app
          </Link>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} title={feature.title} description={feature.description} />
            ))}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
