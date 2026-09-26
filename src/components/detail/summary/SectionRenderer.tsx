import { formatTimestamp } from "@/lib/format";
import type { SummarySection } from "@/types/meeting";

function TimeLink({ time, onJump }: { time: number; onJump: (t: number) => void }) {
  return (
    <button
      type="button"
      onClick={() => onJump(time)}
      title="Jump to this moment in the transcript"
      className="rounded px-1 font-mono text-xs font-semibold tabular-nums text-[#0F6E56] hover:bg-[#0F6E56]/10 hover:underline dark:text-[#3EC79A] dark:hover:bg-[#3EC79A]/15"
    >
      @{formatTimestamp(time)}
    </button>
  );
}

const list = "mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed marker:text-[#0F6E56]/50 dark:marker:text-[#3EC79A]/50";

/** Renders one summary section; the layout depends on the section kind. */
export function SectionRenderer({ section, onJump }: { section: SummarySection; onJump: (t: number) => void }) {
  return (
    <section aria-labelledby={`sec-${section.id}`} className="mb-7">
      <h3 id={`sec-${section.id}`} className="text-base font-bold text-[#201D1A] dark:text-[#F3F4F6]">
        {section.title}
      </h3>

      {section.kind === "paragraph" && (
        <p className="mt-2 text-sm leading-relaxed text-[#201D1A]/80 dark:text-[#F3F4F6]/80">{section.body}</p>
      )}

      {section.kind === "bullets" && (
        <ul className={list}>
          {section.items.map((item, i) => (
            <li key={i} className="text-[#201D1A]/80 dark:text-[#F3F4F6]/80">{item}</li>
          ))}
        </ul>
      )}

      {section.kind === "topics" && (
        <div className="mt-3 space-y-4">
          {section.topics.map((t) => (
            <div key={t.title} className="rounded-xl border border-[#201D1A]/8 bg-white p-4 shadow-2xs dark:border-white/5 dark:bg-white/[0.02]">
              <h4 className="text-sm font-bold text-[#201D1A] dark:text-[#F3F4F6] flex items-center justify-between gap-2">
                <span>{t.title}</span>
                <TimeLink time={t.timestamp} onJump={onJump} />
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-[#201D1A]/80 dark:text-[#F3F4F6]/80">{t.summary}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
