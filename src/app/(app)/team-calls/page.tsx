import type { Metadata } from "next";
import { TeamCallsMock } from "@/components/upsell/mocks";
import { UpsellLayout } from "@/components/upsell/UpsellLayout";

export const metadata: Metadata = { title: "Team Calls | Fathom Clone" };

// Out of scope for this build (paid team feature). Upsell page only.
export default function TeamCallsPage() {
  return (
    <UpsellLayout
      eyebrow="Fathom Team Edition"
      headline="Bring the productivity boost of Fathom to your entire team"
      bullets={[
        "Your team’s customer calls all in one (searchable) place",
        "Automate post-call CRM data entry for your entire team",
        "Conversational analytics to help you identify coaching opportunities",
      ]}
      feature="Team Calls"
      mock={<TeamCallsMock />}
    />
  );
}
