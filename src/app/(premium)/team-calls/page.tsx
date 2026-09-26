import type { Metadata } from "next";
import { FeatureStubPage } from "@/components/premium/FeatureStubPage";

export const metadata: Metadata = { title: "Team Calls | Fathom Clone" };

export default function TeamCallsPage() {
  return (
    <FeatureStubPage
      title="Team Calls"
      description="See every call recorded across your team in one shared library, so nobody has to ask around for a recording or a summary."
    />
  );
}
