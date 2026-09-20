import { GENERAL_REQUIRED_SECTIONS, TEMPLATE_ORDER } from "@/data/templates";
import type { Meeting } from "@/types/meeting";

/**
 * Sanity checks for hand-written seed data. Runs when the data module loads,
 * so a bad speakerId or out-of-range timestamp fails the dev server and the
 * build instead of surfacing as a blank name in the UI.
 */
export function validateMeetings(meetings: Meeting[]): void {
  const errors: string[] = [];
  const tokens = new Set<string>();
  const ids = new Set<string>();

  for (const m of meetings) {
    const at = (msg: string) => errors.push(`[${m.id}] ${msg}`);

    if (ids.has(m.id)) at("duplicate meeting id");
    ids.add(m.id);
    if (tokens.has(m.shareToken)) at("duplicate shareToken");
    tokens.add(m.shareToken);

    const people = new Set(m.attendees.map((a) => a.id));
    if (people.size !== m.attendees.length) at("duplicate attendee id");
    const inRange = (t: number) => t >= 0 && t <= m.durationSec;

    let prev = -1;
    for (const seg of m.transcript) {
      if (!people.has(seg.speakerId)) at(`segment ${seg.id}: unknown speakerId ${seg.speakerId}`);
      if (!inRange(seg.start)) at(`segment ${seg.id}: start ${seg.start} outside duration`);
      if (seg.start < prev) at(`segment ${seg.id}: not in chronological order`);
      prev = seg.start;
    }
    const segIds = m.transcript.map((s) => s.id);
    if (new Set(segIds).size !== segIds.length) at("duplicate transcript segment id");

    for (const a of m.actionItems) {
      if (!people.has(a.assigneeId)) at(`action item ${a.id}: unknown assigneeId ${a.assigneeId}`);
      if (!inRange(a.timestamp)) at(`action item ${a.id}: timestamp outside duration`);
    }

    if (m.highlights.length < 1) at("needs at least one highlight");
    for (const h of m.highlights) {
      if (!inRange(h.timestamp)) at(`highlight ${h.id}: timestamp outside duration`);
      if (!people.has(h.createdById)) at(`highlight ${h.id}: unknown createdById`);
    }

    for (const c of m.chapters ?? []) {
      if (!inRange(c.start)) at(`chapter ${c.id}: start outside duration`);
    }

    for (const template of TEMPLATE_ORDER) {
      const sections = m.summaries[template];
      if (!sections?.length) {
        at(`missing summary for template "${template}"`);
        continue;
      }
      for (const s of sections) {
        if (s.kind === "topics") {
          for (const t of s.topics) {
            if (!inRange(t.timestamp)) at(`${template}/${s.id}: topic "${t.title}" outside duration`);
          }
        }
        if (s.kind === "byPerson") {
          for (const e of s.entries) {
            if (!people.has(e.attendeeId)) at(`${template}/${s.id}: unknown attendeeId ${e.attendeeId}`);
          }
        }
      }
    }
    const generalIds = new Set(m.summaries.general.map((s) => s.id));
    for (const required of GENERAL_REQUIRED_SECTIONS) {
      if (!generalIds.has(required)) at(`general summary missing "${required}" section`);
    }
  }

  if (errors.length) {
    throw new Error(`Invalid seed data:\n  ${errors.join("\n  ")}`);
  }
}
