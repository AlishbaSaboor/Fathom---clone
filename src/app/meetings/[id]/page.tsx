import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { OwnerMeetingView } from "@/components/detail/OwnerMeetingView";
import { getMeetingForOwner } from "@/lib/meetings";
import { requireUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

const getMeeting = cache(async (id: string) => getMeetingForOwner(id, (await requireUser()).id));

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
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F6E56] hover:underline dark:text-[#3EC79A] transition-colors"
      >
        <span aria-hidden>←</span> Back to My Calls
      </Link>
      <OwnerMeetingView meeting={meeting} />
    </>
  );
}
