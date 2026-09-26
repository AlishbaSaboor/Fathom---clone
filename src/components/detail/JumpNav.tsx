const SECTIONS = [
  { id: "summary", label: "Executive Summary" },
  { id: "action-items", label: "Action items" },
  { id: "transcript", label: "Full Transcript" },
];

/**
 * Jump navigation pills matching the warm alabaster / obsidian palette.
 */
export function JumpNav() {
  return (
    <nav
      aria-label="Jump to section"
      className="sticky top-14 z-20 mt-6 flex flex-wrap items-center gap-2 border-b border-[#201D1A]/8 bg-[#FAF9F5]/90 py-2.5 backdrop-blur dark:border-white/10 dark:bg-[#0B0F19]/90"
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-[#201D1A]/50 dark:text-[#F3F4F6]/50">
        Jump to:
      </span>
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="rounded-full border border-[#201D1A]/10 bg-white px-3 py-1 text-xs font-semibold text-[#201D1A]/70 shadow-2xs transition-colors hover:border-[#0F6E56]/30 hover:bg-[#0F6E56]/5 hover:text-[#0F6E56] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#F3F4F6]/70 dark:hover:border-[#3EC79A]/30 dark:hover:bg-[#3EC79A]/10 dark:hover:text-[#3EC79A]"
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}
