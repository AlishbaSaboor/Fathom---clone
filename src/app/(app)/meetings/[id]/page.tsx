import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { OwnerMeetingView } from "@/components/detail/OwnerMeetingView";
import { getMeetingForOwner } from "@/lib/meetings";
import { getOwnerId } from "@/lib/server/owner";

// The owner's view of one of their recordings. Rendered on demand: which
// meetings exist, and whose they are, is only known from the database and the
// visitor's owner cookie. Someone else's id, or an unknown one, is a 404.
export const dynamic = "force-dynamic";

// One database read per request, shared by generateMetadata and the page.
const getMeeting = cache(async (id: string) => getMeetingForOwner(id, await getOwnerId()));

export async function generateMetadata({ params }: PageProps<"/meetings/[id]">): Promise<Metadata> {
  const { id } = await params;
  const meeting = await getMeeting(id);
  return { title: meeting ? `${meeting.title} | Fathom Clone` : "Call not found" };
}

export default async function MeetingPage({ params }: PageProps<"/meetings/[id]">) {
  const { id } = await params;
  const meeting = await getMeeting(id);
  if (!meeting) notFound();

  return (
    <>
      <Link
        href="/calls"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <span aria-hidden>←</span> My Calls
      </Link>
      <OwnerMeetingView meeting={meeting} />
    </>
  );
}
