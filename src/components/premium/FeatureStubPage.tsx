import Link from "next/link";

/**
 * The honest stub shown by each of the four premium nav tabs (Team Calls,
 * Playlists, Alerts, Deals): a real page, a plain description of what the
 * feature would do, and one CTA — no fake dashboards, no invented people or
 * usage stats. The button goes to /pricing rather than showing a message
 * directly, since that's a real destination now.
 */
export function FeatureStubPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto max-w-xl py-12 text-center sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{title}.</h1>
      <p className="mt-4 text-base leading-relaxed text-[#2B241C]/70 dark:text-[#F2EDDD]/70">{description}</p>
      <Link
        href="/pricing"
        className="mt-8 inline-block rounded-lg bg-[#0F6E56] px-6 py-3 text-base font-semibold text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:bg-[#3EC79A] dark:text-[#101B33] dark:focus-visible:outline-[#3EC79A]"
      >
        Start 14-Day Trial
      </Link>
    </div>
  );
}
