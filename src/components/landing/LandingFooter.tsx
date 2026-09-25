import { Wordmark } from "@/components/brand/Logo";

/** The marketing page's footer: wordmark left, one tagline right. No link columns, no copyright line. */
export function LandingFooter() {
  return (
    <footer className="border-t border-[#2B241C]/10 dark:border-[#F2EDDD]/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left sm:px-6">
        <Wordmark />
        <p className="text-sm text-[#2B241C]/70 dark:text-[#F2EDDD]/70">
          AI meeting notetaker that turns recordings into transcripts, summaries, and answers.
        </p>
      </div>
    </footer>
  );
}
