import type { Metadata } from "next";
import { FeatureStubPage } from "@/components/premium/FeatureStubPage";

export const metadata: Metadata = { title: "Deals | Fathom Clone" };

export default function DealsPage() {
  return (
    <FeatureStubPage
      title="Deals"
      description="Connect calls to the deals they're part of, and see every relevant conversation in one place."
    />
  );
}
