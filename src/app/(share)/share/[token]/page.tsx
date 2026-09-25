import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { MeetingDetail } from "@/components/detail/MeetingDetail";
import { getMeetingByShareToken } from "@/lib/meetings";

// Public, read-only view of a recording: the video or audio, the summary, the
// transcript and the action items. No login is required or checked anywhere:
// possession of the token is the entire access control, like a typical "anyone
// with the link" share. The token stops working when the owner deletes the
// recording. Rendered on demand from the database; an unknown token is a 404.
export const dynamic = "force-dynamic";

// One database read per request, shared by generateMetadata and the page.
const getShared = cache((token: string) => getMeetingByShareToken(token));

export async function generateMetadata({ params }: PageProps<"/share/[token]">): Promise<Metadata> {
  const { token } = await params;
  const meeting = await getShared(token);
  return {
    title: meeting ? `${meeting.title} (shared) | Fathom Clone` : "Shared call not found",
    // Shared links are unlisted, so keep them out of search results.
    robots: { index: false, follow: false },
  };
}

export default async function SharedMeetingPage({ params }: PageProps<"/share/[token]">) {
  const { token } = await params;
  const meeting = await getShared(token);
  if (!meeting) notFound();

  // Already sanitized on the server (getMeetingByShareToken): props to a client component end up in the page source.
  return <MeetingDetail meeting={meeting} readOnly />;
}
