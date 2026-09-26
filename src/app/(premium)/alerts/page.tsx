import type { Metadata } from "next";
import { FeatureStubPage } from "@/components/premium/FeatureStubPage";

export const metadata: Metadata = { title: "Alerts | Fathom Clone" };

export default function AlertsPage() {
  return (
    <FeatureStubPage
      title="Alerts"
      description="Get notified the moment a call mentions a keyword, a competitor, or a topic you're tracking, without listening to every recording yourself."
    />
  );
}
