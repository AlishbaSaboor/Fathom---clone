import { Avatar } from "@/components/ui/Avatar";
import { ChevronDownIcon } from "@/components/ui/icons";
import { groupActionItems } from "@/lib/actionItems";
import { formatDueDate, formatTimestamp } from "@/lib/format";
import type { ActionItem, Attendee } from "@/types/meeting";

interface Props {
  items: ActionItem[];
  attendees: Attendee[];
  done: Record<string, boolean>;
  onToggle: (id: string) => void;
  onJump: (t: number) => void;
  readOnly: boolean;
}

function Row({
  item,
  attendees,
  done,
  onToggle,
  onJump,
  readOnly,
}: Omit<Props, "items"> & { item: ActionItem }) {
  const assignee = attendees.find((a) => a.id === item.assigneeId);
  const checked = !!done[item.id];

  return (
    <li className="flex items-start gap-2.5">
      <input
        id={`ai-${item.id}`}
        type="checkbox"
        checked={checked}
        disabled={readOnly}
        onChange={() => onToggle(item.id)}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-violet-600 disabled:cursor-default"
      />
      <div className="min-w-0 flex-1">
        <label
          htmlFor={`ai-${item.id}`}
          className={`block text-sm font-medium leading-snug ${
            checked ? "text-zinc-400 line-through dark:text-zinc-500" : ""
          } ${readOnly ? "" : "cursor-pointer"}`}
        >
          {item.text}
        </label>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
          {assignee && (
            <span className="inline-flex items-center gap-1.5">
              <Avatar attendee={assignee} size="sm" className="!h-5 !w-5 !text-[9px]" />
              {assignee.name}
            </span>
          )}
          <button
            type="button"
            onClick={() => onJump(item.timestamp)}
            title="Jump to this moment in the transcript"
            className="rounded px-1 tabular-nums text-violet-600 hover:underline dark:text-violet-300"
          >
            @ {formatTimestamp(item.timestamp)}
          </button>
          {item.dueDate && <span>Due {formatDueDate(item.dueDate)}</span>}
          {item.priority === "high" && (
            <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              High
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

/**
 * Flat list for the small calls, or collapsible workstream groups when items
 * carry a `group` (the 8-person call has 22 items across 8 workstreams, which
 * is unreadable as one long list).
 */
export function ActionItemList(props: Props) {
  const groups = groupActionItems(props.items);

  if (groups.length === 1 && groups[0].name === null) {
    return (
      <ul className="space-y-3">
        {props.items.map((item) => (
          <Row key={item.id} item={item} {...props} />
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-2">
      {groups.map((g) => {
        const doneInGroup = g.items.filter((a) => props.done[a.id]).length;
        return (
          <details key={g.name} open className="group rounded-lg border border-zinc-200 dark:border-zinc-800">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-violet-600 dark:hover:bg-zinc-900 [&::-webkit-details-marker]:hidden">
              <span>{g.name}</span>
              <span className="flex items-center gap-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">
                <span className="tabular-nums">
                  {doneInGroup}/{g.items.length}
                </span>
                <ChevronDownIcon className="h-4 w-4 transition group-open:rotate-180" />
              </span>
            </summary>
            <ul className="space-y-3 border-t border-zinc-200 px-3 py-3 dark:border-zinc-800">
              {g.items.map((item) => (
                <Row key={item.id} item={item} {...props} />
              ))}
            </ul>
          </details>
        );
      })}
    </div>
  );
}
