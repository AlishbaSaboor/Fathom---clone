// Shown instantly while a playlist's server data is loading — this is the gap
// right after creating one, between the redirect firing and the new page's
// database reads (playlist + owner's meetings) coming back.
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#201D1A] dark:bg-[#0B0F19] dark:text-[#F3F4F6] transition-colors">
      <div className="h-14 border-b border-[#201D1A]/8 dark:border-white/10" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="h-4 w-20 animate-pulse rounded bg-[#201D1A]/10 dark:bg-white/10" />
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="h-8 w-52 animate-pulse rounded bg-[#201D1A]/10 dark:bg-white/10" />
            <div className="mt-2 h-4 w-28 animate-pulse rounded bg-[#201D1A]/10 dark:bg-white/10" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-36 animate-pulse rounded-lg bg-[#201D1A]/10 dark:bg-white/10" />
            <div className="h-10 w-36 animate-pulse rounded-lg bg-[#201D1A]/10 dark:bg-white/10" />
          </div>
        </div>
        <div className="mt-10 h-40 animate-pulse rounded-2xl border border-dashed border-[#201D1A]/20 dark:border-white/20" />
      </main>
    </div>
  );
}
