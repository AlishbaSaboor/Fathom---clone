import type { Metadata } from "next";
import Link from "next/link";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";

export const metadata: Metadata = {
  title: "Fathom Clone — AI Meeting Notetaker",
  description:
    "Real transcripts, summaries and action items from your recordings, an AI chatbot that answers from your actual meeting data, and instant shareable links.",
};

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Upload recording",
    description: "Drop any audio or video recording from Zoom, Google Meet, or Teams (up to 200 MB or 30 min).",
  },
  {
    step: "02",
    title: "Automatic analysis",
    description: "AI generates speaker-identified transcripts, executive takeaways, and action items in seconds.",
  },
  {
    step: "03",
    title: "Act and share",
    description: "Ask questions with AI, export tasks to your team tools, or share the public link with anyone.",
  },
];

const FEATURES = [
  {
    title: "Transcripts, summaries & action items",
    description: "Real transcripts, summaries, and action items generated automatically from your recordings.",
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
 * The minimal marketing landing page at "/":
 * - Header: [Logo] About Fathom | Features | Pricing | Contact us | [Mode] Log in [Open app]
 * - Hero: Headline, subtext, Open app button, and "How it works ↓" anchor button
 * - How it works section (id="how-it-works")
 * - Features section (3 clean cards)
 * - FAQ accordion
 * - Footer with links to Features, Pricing, Contact us, How it works, FAQs, and Privacy Policy
 */
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F5] text-[#201D1A] dark:bg-[#0B0F19] dark:text-[#F3F4F6]">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-4xl px-4 pb-14 pt-16 text-center sm:px-6 sm:pt-24">
          <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
            Understand every meeting, automatically.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[#201D1A]/70 dark:text-[#F3F4F6]/70">
            Real transcripts, summaries, and action items generated automatically from your recordings.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3">
            <Link
              href="/calls"
              className="inline-block rounded-lg bg-[#0F6E56] px-6 py-3 text-base font-semibold text-white shadow-xs transition hover:bg-[#0c5945] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:bg-[#3EC79A] dark:text-[#0B0F19] dark:hover:bg-[#35b58b] dark:focus-visible:outline-[#3EC79A]"
            >
              Open app
            </Link>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#201D1A]/60 hover:text-[#0F6E56] dark:text-[#F3F4F6]/60 dark:hover:text-[#3EC79A] transition-colors py-1"
            >
              How it works &darr;
            </a>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="mx-auto max-w-5xl scroll-mt-20 px-4 pb-20 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            How it works.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-sm text-[#201D1A]/70 dark:text-[#F3F4F6]/70">
            Three simple steps from recorded video to actionable intelligence.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-[#201D1A]/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-white/[0.03]"
              >
                <span className="text-xs font-mono font-bold text-[#0F6E56] dark:text-[#3EC79A]">
                  {item.step}
                </span>
                <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#201D1A]/70 dark:text-[#F3F4F6]/70">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} title={feature.title} description={feature.description} />
            ))}
          </div>
        </section>

        {/* FAQ Accordion */}
        <LandingFAQ />
      </main>

      <LandingFooter />
    </div>
  );
}
