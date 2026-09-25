import { initials } from "@/lib/format";
import type { Attendee } from "@/types/meeting";

const sizes = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-xs",
} as const;

export function Avatar({
  attendee,
  size = "md",
  className = "",
}: {
  attendee: Pick<Attendee, "name" | "avatarColor">;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      title={attendee.name}
      style={{ backgroundColor: attendee.avatarColor }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${sizes[size]} ${className}`}
    >
      {initials(attendee.name)}
    </span>
  );
}

/**
 * Overlapping avatars with a "+N" overflow chip. The overlap is deliberately
 * light (a 4px sliver, not a heavy stack): with only two letters of initials in
 * each circle, a heavier overlap starts running initials into each other.
 */
export function AvatarStack({
  attendees,
  max = 4,
  size = "sm",
  ringClassName = "ring-white dark:ring-zinc-900",
}: {
  attendees: Attendee[];
  max?: number;
  size?: keyof typeof sizes;
  /** The ring's color should match whatever the stack sits on; override when that isn't the default card background. */
  ringClassName?: string;
}) {
  const shown = attendees.slice(0, max);
  const extra = attendees.length - shown.length;
  return (
    <div className="flex items-center" role="img" aria-label={`${attendees.length} attendees`}>
      {shown.map((a, i) => (
        <Avatar key={a.id} attendee={a} size={size} className={`ring-2 ${ringClassName} ${i > 0 ? "-ml-1" : ""}`} />
      ))}
      {extra > 0 && (
        <span
          className={`-ml-1 inline-flex items-center justify-center rounded-full bg-zinc-200 font-medium text-zinc-700 ring-2 dark:bg-zinc-700 dark:text-zinc-100 ${ringClassName} ${sizes[size]}`}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
