import type { Metadata } from "next";
import { FeatureStubPage } from "@/components/premium/FeatureStubPage";

export const metadata: Metadata = { title: "Team Calls | Fathom Clone" };

export default function TeamCallsPage() {
  return (
    <FeatureStubPage
      title="Team Calls"
      tier="Pro"
      price="$19"
      description="See every call recorded across your team in one shared library, so nobody has to ask around for a recording, summary, or customer insight."
      benefits={[
        { title: "Shared Workspace Library", desc: "Access recordings across sales, product, and success automatically." },
        { title: "Call Coaching & Talk Ratios", desc: "Monitor rep talk-to-listen balance and customer sentiment." },
        { title: "Universal Search", desc: "Search transcript keywords across all team calls simultaneously." },
      ]}
    />
  );
}
