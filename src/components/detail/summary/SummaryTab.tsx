"use client";

import { CopyButton } from "@/components/ui/CopyButton";
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
  const sections = meeting.summaries[template];

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <TemplateSwitcher value={template} onChange={onTemplateChange} />
        <CopyButton
          label="Copy Summary"
          getText={() => summaryToText(sections, meeting.attendees)}
        />
      </div>

      {/* Keyed by template so the swap is a clean re-render of the new structure. */}
      <div key={template}>
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
