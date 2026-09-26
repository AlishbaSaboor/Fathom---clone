import type { Metadata } from "next";
import { FeatureStubPage } from "@/components/premium/FeatureStubPage";

export const metadata: Metadata = { title: "Deals | Fathom Clone" };

export default function DealsPage() {
  return (
    <FeatureStubPage
      title="Deal Intelligence"
      tier="Plus"
      price="$39"
      description="Automatic CRM pipeline health and momentum extracted directly from customer meeting transcripts, buyer sentiment, and next steps."
      benefits={[
        { title: "Automated CRM Sync", desc: "Enrich Salesforce and HubSpot opportunities with zero rep data entry." },
        { title: "AI Deal Health Scoring", desc: "Pinpoint stalled deals, ghosting risks, and high-momentum opportunities." },
        { title: "Buying Committee Mapping", desc: "Track decision maker attendance and key objections across every call." },
      ]}
    />
  );
}
