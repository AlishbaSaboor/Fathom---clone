"use client";

import { CopyButton } from "@/components/ui/CopyButton";
import { summaryToText } from "@/lib/export";
import type { Meeting } from "@/types/meeting";
import { SectionRenderer } from "./SectionRenderer";

export function SummaryTab({ meeting, onJump }: { meeting: Meeting; onJump: (t: number) => void }) {
  const sections = meeting.summaries.general;

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <CopyButton label="Copy Summary" getText={() => summaryToText(sections)} />
      </div>
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} onJump={onJump} />
      ))}
    </div>
  );
}
