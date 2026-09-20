import type { Metadata } from "next";
import { AlertsMock } from "@/components/upsell/mocks";
import { UpsellLayout } from "@/components/upsell/UpsellLayout";

export const metadata: Metadata = { title: "Alerts | Fathom Clone" };

// Out of scope for this build (paid feature). Upsell page only.
export default function AlertsPage() {
  return (
    <UpsellLayout
      eyebrow="Alerts"
      headline="Know the moment something important comes up on a call"
      intro="Alerts watch every call for the keywords and topics you care about and let you know right away. Use alerts to:"
      bullets={[
        "Get notified when a competitor or key term is mentioned",
        "Spot deal risks like pricing objections and churn signals early",
        "Send alerts to your team by email or Slack",
      ]}
      feature="Alerts"
      mock={<AlertsMock />}
    />
  );
}
