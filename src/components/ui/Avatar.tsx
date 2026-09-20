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

/** Overlapping avatars with a "+N" overflow chip. */
export function AvatarStack({
  attendees,
  max = 4,
  size = "sm",
}: {
  attendees: Attendee[];
  max?: number;
  size?: keyof typeof sizes;
}) {
  const shown = attendees.slice(0, max);
  const extra = attendees.length - shown.length;
  return (
    <div className="flex items-center" role="img" aria-label={`${attendees.length} attendees`}>
      {shown.map((a, i) => (
        <Avatar
          key={a.id}
          attendee={a}
          size={size}
          className={`ring-2 ring-white dark:ring-zinc-900 ${i > 0 ? "-ml-1" : ""}`}
        />
      ))}
      {extra > 0 && (
        <span
          className={`-ml-1 inline-flex items-center justify-center rounded-full bg-zinc-200 font-medium text-zinc-700 ring-2 ring-white dark:bg-zinc-700 dark:text-zinc-100 dark:ring-zinc-900 ${sizes[size]}`}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
