import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MeetingDetail } from "@/components/detail/MeetingDetail";
import { getAllMeetingIds, getMeetingById } from "@/lib/meetings";

// Only the seeded meeting ids exist; anything else is a 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getAllMeetingIds()).map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps<"/meetings/[id]">): Promise<Metadata> {
  const { id } = await params;
  const meeting = await getMeetingById(id);
  return { title: meeting ? `${meeting.title} | Fathom Clone` : "Call not found" };
}

export default async function MeetingPage({ params }: PageProps<"/meetings/[id]">) {
  const { id } = await params;
  const meeting = await getMeetingById(id);
  if (!meeting) notFound();

  return (
    <>
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        <span aria-hidden>←</span> My Calls
      </Link>
      <MeetingDetail meeting={meeting} />
    </>
  );
}
