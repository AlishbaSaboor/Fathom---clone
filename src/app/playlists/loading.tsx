// Shown instantly while /playlists' server data (the session check, then the
// playlist list) is still loading — without this, Next renders nothing here
// and a slow database round trip just looks like a frozen page.
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#201D1A] dark:bg-[#0B0F19] dark:text-[#F3F4F6] transition-colors">
      <div className="h-14 border-b border-[#201D1A]/8 dark:border-white/10" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="h-8 w-40 animate-pulse rounded bg-[#201D1A]/10 dark:bg-white/10" />
          <div className="h-10 w-36 animate-pulse rounded-lg bg-[#201D1A]/10 dark:bg-white/10" />
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-[#201D1A]/10 bg-white dark:border-white/10 dark:bg-white/[0.03]"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
