import { Avatar } from "@/components/ui/Avatar";
import { formatTimestamp } from "@/lib/format";
import type { Attendee, SummarySection } from "@/types/meeting";

function TimeLink({ time, onJump }: { time: number; onJump: (t: number) => void }) {
  return (
    <button
      type="button"
      onClick={() => onJump(time)}
      title="Jump to this moment in the transcript"
      className="rounded px-1 text-xs font-medium tabular-nums text-violet-600 hover:bg-violet-50 hover:underline dark:text-violet-300 dark:hover:bg-violet-950"
    >
      @ {formatTimestamp(time)}
    </button>
  );
}

const list = "mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed marker:text-zinc-400";

/** Renders one summary section. Layout depends on the section kind, which is what makes templates look different. */
export function SectionRenderer({
  section,
  attendees,
  onJump,
}: {
  section: SummarySection;
  attendees: Attendee[];
  onJump: (t: number) => void;
}) {
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

      {section.kind === "byPerson" && (
        <div className="mt-3 space-y-4">
          {section.entries.map((e) => {
            const person = attendees.find((a) => a.id === e.attendeeId);
            if (!person) return null;
            return (
              <div key={e.attendeeId}>
                <div className="flex items-center gap-2">
                  <Avatar attendee={person} size="sm" />
                  <h4 className="text-sm font-semibold">{person.name}</h4>
                </div>
                <ul className={list}>
                  {e.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
