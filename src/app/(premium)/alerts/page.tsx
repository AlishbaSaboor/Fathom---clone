import type { Metadata } from "next";
import { FeatureStubPage } from "@/components/premium/FeatureStubPage";

export const metadata: Metadata = { title: "Alerts | Fathom AI" };

export default function AlertsPage() {
  return (
    <FeatureStubPage
      title="Real-Time Alerts"
      tier="Plus"
      price="$39"
      description="Never miss a critical moment. Get instant Slack or email alerts when competitors, pricing objections, or churn risks are mentioned in any meeting."
      benefits={[
        { title: "Competitor Monitoring", desc: "Track mentions of competitors (e.g., Gong, Chorus) with exact timestamps." },
        { title: "Churn & Risk Escalation", desc: "AI automatically flags customer frustration and bug complaints." },
        { title: "Instant Slack & Email Routing", desc: "Send triggered snippets directly into rep channels." },
      ]}
    />
  );
}
