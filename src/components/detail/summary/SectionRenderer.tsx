import { formatTimestamp } from "@/lib/format";
import type { SummarySection } from "@/types/meeting";

function TimeLink({ time, onJump }: { time: number; onJump: (t: number) => void }) {
  return (
    <button
      type="button"
      onClick={() => onJump(time)}
      title="Jump to this moment in the transcript"
      className="rounded px-1 text-xs font-medium tabular-nums text-blue-600 hover:bg-blue-50 hover:underline dark:text-blue-300 dark:hover:bg-blue-950"
    >
      @ {formatTimestamp(time)}
    </button>
  );
}

const list = "mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed marker:text-zinc-400";

/** Renders one summary section; the layout depends on the section kind. */
export function SectionRenderer({ section, onJump }: { section: SummarySection; onJump: (t: number) => void }) {
  return (
    <section aria-labelledby={`sec-${section.id}`} className="mb-7">
      <h3 id={`sec-${section.id}`} className="text-base font-semibold">
        {section.title}
      </h3>

      {section.kind === "paragraph" && (
        <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{section.body}</p>
      )}

      {section.kind === "bullets" && (
        <ul className={list}>
          {section.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}

      {section.kind === "topics" && (
        <div className="mt-3 space-y-4">
          {section.topics.map((t) => (
            <div key={t.title}>
              <h4 className="text-sm font-semibold">
                {t.title} <TimeLink time={t.timestamp} onJump={onJump} />
              </h4>
              <p className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{t.summary}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
