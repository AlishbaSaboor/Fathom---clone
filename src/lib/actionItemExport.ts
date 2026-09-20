import { groupActionItems } from "@/lib/actionItems";
import { formatDate, formatDuration, formatDueDate, formatDueDateFull } from "@/lib/format";
import type { ActionItem, Meeting } from "@/types/meeting";

// "Copy for..." formats. No OAuth or API connection to any of these tools (out of
// scope for this build): each destination just gets text laid out the way that
// tool likes to receive pasted content, and the app copies it to the clipboard.

export type Destination = "asana" | "google-docs" | "gmail" | "todoist" | "word";

export const DESTINATIONS: { id: Destination; label: string }[] = [
  { id: "asana", label: "Asana" },
  { id: "google-docs", label: "Google Docs" },
  { id: "gmail", label: "Gmail" },
  { id: "todoist", label: "Todoist" },
  { id: "word", label: "Microsoft Word" },
];

export interface ExportResult {
  /** Always present: what lands on the clipboard as text/plain. */
  plain: string;
  /** Optional rich version (headings and real lists) so pasting into Gmail, Docs or Word keeps its structure. */
  html?: string;
  /** How many action items the result contains. */
  count: number;
  /** Set when there was nothing to copy; the message explains why. */
  emptyReason?: string;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

interface Ctx {
  meeting: Meeting;
  done: Record<string, boolean>;
}

const assigneeName = ({ meeting }: Ctx, item: ActionItem) =>
  meeting.attendees.find((a) => a.id === item.assigneeId)?.name;

const isDone = ({ done }: Ctx, item: ActionItem) => !!done[item.id];

/** "Priya Nair, due Sep 22, 2026, high priority" from whichever parts exist. */
function detailParts(ctx: Ctx, item: ActionItem, opts: { priority?: boolean } = { priority: true }): string[] {
  const parts: string[] = [];
  const who = assigneeName(ctx, item);
  if (who) parts.push(who);
  if (item.dueDate) parts.push(`due ${formatDueDateFull(item.dueDate)}`);
  if (opts.priority && item.priority === "high") parts.push("high priority");
  return parts;
}

const headline = (meeting: Meeting) => `${meeting.title} (${formatDate(meeting.date)})`;

function noItems(): ExportResult {
  return { plain: "", count: 0, emptyReason: "This call has no action items to copy." };
}

// ---------------------------------------------------------------- Gmail

function emailBodyPlain(ctx: Ctx, items: ActionItem[]): string {
  const groups = groupActionItems(items);
  const grouped = groups.length > 1 || groups[0]?.name !== null;
  let n = 0;
  const lines: string[] = [];
  for (const g of groups) {
    if (grouped && g.name) lines.push("", g.name);
    for (const item of g.items) {
      const detail = detailParts(ctx, item);
      lines.push(`${++n}. ${item.text}${detail.length ? ` (${detail.join(", ")})` : ""}${isDone(ctx, item) ? " [done]" : ""}`);
    }
  }
  return lines.join("\n").trim();
}

function emailBodyHtml(ctx: Ctx, items: ActionItem[]): string {
  const groups = groupActionItems(items);
  const grouped = groups.length > 1 || groups[0]?.name !== null;
  const li = (item: ActionItem) => {
    const detail = detailParts(ctx, item);
    return `<li>${escapeHtml(item.text)}${detail.length ? ` <em>(${escapeHtml(detail.join(", "))})</em>` : ""}${
      isDone(ctx, item) ? " <strong>[done]</strong>" : ""
    }</li>`;
  };
  if (!grouped) return `<ol>${groups[0].items.map(li).join("")}</ol>`;
  return groups.map((g) => `<p><strong>${escapeHtml(g.name ?? "Other")}</strong></p><ul>${g.items.map(li).join("")}</ul>`).join("");
}

function gmail(ctx: Ctx): ExportResult {
  const items = ctx.meeting.actionItems;
  if (!items.length) return noItems();
  const subject = `Action items from ${headline(ctx.meeting)}`;
  const intro = `Here are the action items from ${headline(ctx.meeting)}:`;
  const outro = "Please reply if anything looks wrong or is missing.";
  const plain = `Subject: ${subject}\n\nHi all,\n\n${intro}\n\n${emailBodyPlain(ctx, items)}\n\n${outro}\n\nThanks`;
  const html =
    `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p><p>Hi all,</p><p>${escapeHtml(intro)}</p>` +
    `${emailBodyHtml(ctx, items)}<p>${escapeHtml(outro)}</p><p>Thanks</p>`;
  return { plain, html, count: items.length };
}

/**
 * The "Copy Follow-up Email" button: a fuller email than the Gmail option, with
 * the meeting's purpose and key takeaways before the action items.
 */
export function buildFollowUpEmail(meeting: Meeting, done: Record<string, boolean>): ExportResult {
  const ctx: Ctx = { meeting, done };
  const general = meeting.summaries.general;
  const purpose = general.find((s) => s.id === "purpose");
  const takeaways = general.find((s) => s.id === "takeaways");
  const purposeText = purpose?.kind === "paragraph" ? purpose.body : "";
  const takeawayItems = takeaways?.kind === "bullets" ? takeaways.items : [];
  const items = meeting.actionItems;

  const subject = `Follow-up: ${headline(meeting)}`;
  const plainParts = ["Hi all,", "", `Thanks for your time on ${headline(meeting)}. Here is a quick recap.`];
  const htmlParts = [`<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>`, "<p>Hi all,</p>", `<p>Thanks for your time on ${escapeHtml(headline(meeting))}. Here is a quick recap.</p>`];
  if (purposeText) {
    plainParts.push("", "Purpose", purposeText);
    htmlParts.push("<p><strong>Purpose</strong></p>", `<p>${escapeHtml(purposeText)}</p>`);
  }
  if (takeawayItems.length) {
    plainParts.push("", "Key takeaways", ...takeawayItems.map((t) => `- ${t}`));
    htmlParts.push("<p><strong>Key takeaways</strong></p>", `<ul>${takeawayItems.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`);
  }
  if (items.length) {
    plainParts.push("", "Action items", emailBodyPlain(ctx, items));
    htmlParts.push("<p><strong>Action items</strong></p>", emailBodyHtml(ctx, items));
  }
  plainParts.push("", "Let me know if I missed anything.", "", "Thanks");
  htmlParts.push("<p>Let me know if I missed anything.</p>", "<p>Thanks</p>");

  return { plain: `Subject: ${subject}\n\n${plainParts.join("\n")}`, html: htmlParts.join(""), count: items.length };
}

// ---------------------------------------------------------------- Asana

/**
 * One task per line, which is how Asana turns pasted text into tasks. Only
 * open items: tasks that are already done should not be recreated. When the
 * call has workstream groups, each group becomes a "Section:" line, which Asana
 * turns into a section header when pasted into a list.
 */
function asana(ctx: Ctx): ExportResult {
  const open = ctx.meeting.actionItems.filter((i) => !isDone(ctx, i));
  if (!ctx.meeting.actionItems.length) return noItems();
  if (!open.length) return { plain: "", count: 0, emptyReason: "Every action item is already done, so there are no open tasks to copy." };

  const groups = groupActionItems(open);
  const grouped = groups.length > 1 || groups[0]?.name !== null;
  const lines: string[] = [];
  for (const g of groups) {
    if (grouped && g.name) lines.push(`${g.name}:`);
    for (const item of g.items) {
      const bits: string[] = [];
      const who = assigneeName(ctx, item);
      if (who) bits.push(`Assignee: ${who}`);
      if (item.dueDate) bits.push(`Due: ${formatDueDateFull(item.dueDate)}`);
      if (item.priority === "high") bits.push("Priority: High");
      lines.push(bits.length ? `${item.text} (${bits.join(", ")})` : item.text);
    }
  }
  return { plain: lines.join("\n"), count: open.length };
}

// ---------------------------------------------------------------- Todoist

const labelFor = (name: string) => name.split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9_-]/g, "");

/**
 * Todoist quick-add syntax, one task per line: "@label" for the person (Todoist
 * labels; assigning a person needs a shared project, which text cannot do),
 * "p1" for high priority, and a natural-language date such as "Oct 2". Only
 * open items. There are no section lines: a header line would become a task.
 */
function todoist(ctx: Ctx): ExportResult {
  const open = ctx.meeting.actionItems.filter((i) => !isDone(ctx, i));
  if (!ctx.meeting.actionItems.length) return noItems();
  if (!open.length) return { plain: "", count: 0, emptyReason: "Every action item is already done, so there are no open tasks to copy." };

  const lines = open.map((item) => {
    const who = assigneeName(ctx, item);
    const parts = [item.text];
    if (who && labelFor(who)) parts.push(`@${labelFor(who)}`);
    if (item.priority === "high") parts.push("p1");
    if (item.dueDate) parts.push(formatDueDate(item.dueDate));
    return parts.join(" ");
  });
  return { plain: lines.join("\n"), count: open.length };
}

// ---------------------------------------------------- Google Docs / Word

/**
 * A readable document section: a title, a one-line summary, then bullets under
 * headings. Both a plain-text version and an HTML version (real headings and
 * bullet lists) are produced, and the browser pastes whichever the target
 * supports, so Docs and Word keep the structure.
 */
function document_(ctx: Ctx): ExportResult {
  const items = ctx.meeting.actionItems;
  if (!items.length) return noItems();
  const m = ctx.meeting;
  const doneCount = items.filter((i) => isDone(ctx, i)).length;
  const summary = `${formatDate(m.date)} · ${formatDuration(m.durationSec)} · ${items.length} action items (${doneCount} done)`;

  const groups = groupActionItems(items);
  const grouped = groups.length > 1 || groups[0]?.name !== null;
  const bullet = (item: ActionItem) => {
    const detail = detailParts(ctx, item);
    return `• [${isDone(ctx, item) ? "x" : " "}] ${item.text}${detail.length ? ` — ${detail.join(", ")}` : ""}`;
  };

  const plain: string[] = [`Action items: ${m.title}`, summary, ""];
  for (const g of groups) {
    if (grouped && g.name) plain.push(g.name.toUpperCase());
    plain.push(...g.items.map(bullet), "");
  }

  const li = (item: ActionItem) => {
    const detail = detailParts(ctx, item);
    return `<li>${isDone(ctx, item) ? "☑" : "☐"} ${escapeHtml(item.text)}${detail.length ? ` <em>— ${escapeHtml(detail.join(", "))}</em>` : ""}</li>`;
  };
  const html =
    `<h1>Action items: ${escapeHtml(m.title)}</h1><p>${escapeHtml(summary)}</p>` +
    groups
      .map((g) => `${grouped && g.name ? `<h2>${escapeHtml(g.name)}</h2>` : ""}<ul>${g.items.map(li).join("")}</ul>`)
      .join("");

  return { plain: plain.join("\n").trim(), html, count: items.length };
}

export function buildActionItemExport(dest: Destination, meeting: Meeting, done: Record<string, boolean>): ExportResult {
  const ctx: Ctx = { meeting, done };
  switch (dest) {
    case "gmail":
      return gmail(ctx);
    case "asana":
      return asana(ctx);
    case "todoist":
      return todoist(ctx);
    case "google-docs":
    case "word":
      return document_(ctx);
  }
}
