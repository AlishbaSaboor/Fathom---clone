"use client";

import { CopyButton } from "@/components/ui/CopyButton";
import { TEMPLATE_ORDER, TEMPLATES } from "@/data/templates";
import { summaryToText } from "@/lib/export";
import type { Meeting, TemplateId } from "@/types/meeting";
import { SectionRenderer } from "./SectionRenderer";
import { TemplateSwitcher } from "./TemplateSwitcher";

export function SummaryTab({
  meeting,
  template,
  onTemplateChange,
  onJump,
}: {
  meeting: Meeting;
  template: TemplateId;
  onTemplateChange: (id: TemplateId) => void;
  onJump: (t: number) => void;
}) {
  // Seeded meetings have every template; an uploaded recording only has General.
  const available = TEMPLATE_ORDER.filter((t) => meeting.summaries[t]);
  const active = meeting.summaries[template] ? template : "general";
  const sections = meeting.summaries[active] ?? meeting.summaries.general;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        {available.length > 1 ? (
          <TemplateSwitcher value={active} onChange={onTemplateChange} available={available} />
        ) : (
          <span className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium dark:border-zinc-700">
            {TEMPLATES[active].label}
          </span>
        )}
        <CopyButton
          label="Copy Summary"
          getText={() => summaryToText(sections, meeting.attendees)}
        />
      </div>

      {/* Keyed by template so the swap is a clean re-render of the new structure. */}
      <div key={active}>
        {sections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            attendees={meeting.attendees}
            onJump={onJump}
          />
        ))}
      </div>
    </div>
  );
}
