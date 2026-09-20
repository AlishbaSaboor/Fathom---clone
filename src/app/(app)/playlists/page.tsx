import type { Metadata } from "next";
import { PlaylistsMock } from "@/components/upsell/mocks";
import { UpsellLayout } from "@/components/upsell/UpsellLayout";

export const metadata: Metadata = { title: "Playlists | Fathom Clone" };

// Out of scope for this build (paid feature). Upsell page only.
export default function PlaylistsPage() {
  return (
    <UpsellLayout
      eyebrow="Playlists"
      headline="Create shareable playlists of highlights"
      intro="Playlists allow you to save highlights from your calls into organized collections that are easily sharable. Use playlists to:"
      bullets={[
        "Organize feedback across multiple meetings",
        "Create training libraries of key moments in customer or prospect calls",
        "Share customer testimonials",
      ]}
      feature="Playlists"
      mock={<PlaylistsMock />}
    />
  );
}
