import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { MeetingDetail } from "@/components/detail/MeetingDetail";
import { loadUploadShare } from "@/lib/uploadShare";

// Public, read-only view of an UPLOADED recording's transcript and summary.
// Same model as /share/[token]: possession of the token is the access check,
// there is no login. Unlike the demo shares these are stored at runtime, so the
// page is rendered on demand from the store instead of being prerendered, and
// an unknown or expired (30-day) token is a 404. The recording itself is not
// stored server-side, so there is no player.
export const dynamic = "force-dynamic";

// One store read per request, shared by generateMetadata and the page.
const getShared = cache((token: string) => loadUploadShare(token));

export async function generateMetadata({ params }: PageProps<"/share/upload/[token]">): Promise<Metadata> {
  const { token } = await params;
  const meeting = await getShared(token);
  return {
    title: meeting ? `${meeting.title} (shared) | Fathom Clone` : "Shared call not found",
    // Shared links are unlisted, so keep them out of search results.
    robots: { index: false, follow: false },
  };
}

export default async function SharedUploadPage({ params }: PageProps<"/share/upload/[token]">) {
  const { token } = await params;
  const meeting = await getShared(token);
  if (!meeting) notFound();

  return (
    <MeetingDetail
      meeting={meeting}
      readOnly
      recordingNote="Recording not available in this preview, only the transcript and summary."
    />
  );
}
