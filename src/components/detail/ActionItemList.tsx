import { Avatar } from "@/components/ui/Avatar";
import { formatTimestamp } from "@/lib/format";
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
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#0F6E56] disabled:cursor-default dark:accent-[#3EC79A]"
      />
      <div className="min-w-0 flex-1">
        <label
          htmlFor={`ai-${item.id}`}
          className={`block text-sm font-medium leading-snug ${
            checked ? "text-[#2B241C]/40 line-through dark:text-[#F2EDDD]/40" : ""
          } ${readOnly ? "" : "cursor-pointer"}`}
        >
          {item.text}
        </label>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#2B241C]/60 dark:text-[#F2EDDD]/60">
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
            className="rounded px-1 tabular-nums text-[#0F6E56] hover:underline dark:text-[#3EC79A]"
          >
            @ {formatTimestamp(item.timestamp)}
          </button>
        </div>
      </div>
    </li>
  );
}

export function ActionItemList(props: Props) {
  if (props.items.length === 0) {
    return <p className="text-sm text-[#2B241C]/60 dark:text-[#F2EDDD]/60">No action items were found in this call.</p>;
  }
  return (
    <ul className="space-y-3">
      {props.items.map((item) => (
        <Row key={item.id} item={item} {...props} />
      ))}
    </ul>
  );
}
