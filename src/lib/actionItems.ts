import type { ActionItem } from "@/types/meeting";

export interface ActionItemGroup {
  /** null when the meeting's items are not grouped (the small calls). */
  name: string | null;
  items: ActionItem[];
}

/**
 * Groups by workstream in order of first appearance. Meetings whose items carry
 * no `group` (the small calls) come back as one unnamed group, so the caller can
 * render a flat list. Items missing a group in an otherwise grouped meeting
 * fall under "Other".
 */
export function groupActionItems(items: ActionItem[]): ActionItemGroup[] {
  if (!items.some((a) => a.group)) return [{ name: null, items }];
  const groups = new Map<string, ActionItem[]>();
  for (const item of items) {
    const key = item.group ?? "Other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return [...groups].map(([name, list]) => ({ name, items: list }));
}
