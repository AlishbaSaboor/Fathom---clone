const SECTIONS = [
  { id: "summary", label: "Summary" },
  { id: "transcript", label: "Transcript" },
  { id: "action-items", label: "Action items" },
];

/**
 * Plain anchor links to the sections below, scrolled to natively by the
 * browser (each section has a matching `scroll-mt` so it lands under the
 * sticky header). No active-section tracking: this is a continuous page, not
 * a tab switcher, so there's nothing to keep in sync.
 */
export function JumpNav() {
  return (
    <nav
      aria-label="Jump to section"
      className="mt-6 flex flex-wrap items-center gap-2 border-b border-[#2B241C]/10 pb-4 dark:border-[#F2EDDD]/10"
    >
      <span className="text-xs font-medium uppercase tracking-wide text-[#2B241C]/50 dark:text-[#F2EDDD]/50">
        Jump to:
      </span>
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="rounded-full border border-[#2B241C]/20 px-3 py-1.5 text-xs font-medium hover:bg-[#2B241C]/5 dark:border-[#F2EDDD]/20 dark:hover:bg-[#F2EDDD]/10"
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}
