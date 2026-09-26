import type { Metadata } from "next";
import { FeatureStubPage } from "@/components/premium/FeatureStubPage";

export const metadata: Metadata = { title: "Playlists | Fathom Clone" };

export default function PlaylistsPage() {
  return (
    <FeatureStubPage
      title="Playlists"
      description="Curate a themed collection of call moments — an onboarding library, competitive intel, your best discovery calls — and share it as one link."
    />
  );
}
