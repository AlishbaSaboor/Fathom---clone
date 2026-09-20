import type { TemplateId } from "@/types/meeting";

export interface TemplateInfo {
  id: TemplateId;
  label: string;
  description: string;
}

// Real Fathom regenerates the summary with an LLM per template. That is out of
// scope here: every meeting ships a pre-written summary for each template in
// its seed data (Meeting.summaries), and this file only describes the options.
export const TEMPLATES: Record<TemplateId, TemplateInfo> = {
  general: {
    id: "general",
    label: "General",
    description: "Purpose, key takeaways, topics and next steps",
  },
  sales: {
    id: "sales",
    label: "Sales",
    description: "Customer signals, deal risks, requests and follow-ups",
  },
  standup: {
    id: "standup",
    label: "Standup",
    description: "Done, doing next and blockers, grouped by person",
  },
};

export const TEMPLATE_ORDER: TemplateId[] = ["general", "sales", "standup"];

export const DEFAULT_TEMPLATE: TemplateId = "general";

/** Section ids every `general` summary must contain. Enforced in lib/validate.ts. */
export const GENERAL_REQUIRED_SECTIONS = [
  "purpose",
  "takeaways",
  "topics",
  "next-steps",
] as const;
