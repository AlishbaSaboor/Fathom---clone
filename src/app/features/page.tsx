import type { Metadata } from "next";
import Link from "next/link";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";

export const metadata: Metadata = {
  title: "Features | Fathom AI",
  description: "Explore Fathom's AI transcription, executive summaries, Ask Fathom search, and instant shareable links.",
};

const FEATURES = [
  {
    title: "Accurate AI Transcripts",
    description: "Multi-speaker identification with timestamps. Every spoken word is indexed and searchable across the entire meeting.",
    tag: "Gemini 1.5 Powered",
  },
  {
    title: "Executive Summaries & Takeaways",
    description: "Concise summaries of what was discussed, key decisions made, and follow-ups extracted directly from the transcript.",
    tag: "Instant Synthesis",
  },
  {
    title: "Interactive Action Items",
    description: "Tasks with assigned owners and clickable timestamps. Checkboxes are saved directly to your account.",
    tag: "Saveable Checklists",
  },
  {
    title: "Ask Fathom AI Chatbot",
    description: "Query an individual call or search across your entire archive. Answers include clickable citations back to the exact timestamp.",
    tag: "Cited Answers",
  },
  {
    title: "Instant Shareable Links",
    description: "Every recording gets a dedicated public link. Recipients can watch the video, read transcripts, and query Ask Fathom without logging in.",
    tag: "Frictionless Sharing",
  },
  {
    title: "One-Click Formatted Exports",
    description: "Copy action items and summaries pre-formatted for Asana, Gmail, Google Docs, Todoist, and Microsoft Word.",
    tag: "Tool Integrations",
  },
];

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F5] text-[#201D1A] dark:bg-[#0B0F19] dark:text-[#F3F4F6]">
      <LandingHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 pb-12 pt-16 text-center sm:px-6 sm:pt-24">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Features.</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#201D1A]/70 dark:text-[#F3F4F6]/70">
            Everything you need to turn recordings into actionable notes and answers.
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex flex-col justify-between rounded-2xl border border-[#201D1A]/10 bg-white p-6 shadow-xs dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0F6E56] dark:text-[#3EC79A]">
                    {f.tag}
                  </span>
                  <h2 className="mt-2 text-lg font-bold">{f.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#201D1A]/70 dark:text-[#F3F4F6]/70">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/calls"
              className="inline-block rounded-lg bg-[#0F6E56] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-[#3EC79A] dark:text-[#0B0F19]"
            >
              Open app &rarr;
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
