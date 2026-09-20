import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MeetingDetail } from "@/components/detail/MeetingDetail";
import { getAllShareTokens, getMeetingByShareToken } from "@/lib/meetings";
import { toPublicMeeting } from "@/lib/publicMeeting";

// Public, read-only view of a meeting. No login is required or checked
// anywhere: possession of the token is the entire access control, like a
// typical "anyone with the link" share. Revocation, expiry and per-link
// permissions are out of scope (stubbed), so a token stays valid forever.
//
// Prerendered from the seeded tokens; any other token is a 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getAllShareTokens()).map((token) => ({ token }));
}

export async function generateMetadata({ params }: PageProps<"/share/[token]">): Promise<Metadata> {
  const { token } = await params;
  const meeting = await getMeetingByShareToken(token);
  return {
    title: meeting ? `${meeting.title} (shared) | Fathom Clone` : "Shared call not found",
    // Shared links are unlisted, so keep them out of search results.
    robots: { index: false, follow: false },
  };
}

export default async function SharedMeetingPage({ params }: PageProps<"/share/[token]">) {
  const { token } = await params;
  const meeting = await getMeetingByShareToken(token);
  if (!meeting) notFound();

  // Sanitized on the server: props to a client component end up in the page source.
  return <MeetingDetail meeting={toPublicMeeting(meeting)} readOnly />;
}
