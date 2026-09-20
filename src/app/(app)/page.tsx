import type { Metadata } from "next";
import { MeetingGrid } from "@/components/meetings/MeetingGrid";
import { getMeetingList } from "@/lib/meetings";

export const metadata: Metadata = { title: "My Calls | Fathom Clone" };

export default async function MyCallsPage() {
  const meetings = await getMeetingList();

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">My Calls</h1>
      <MeetingGrid meetings={meetings} />
    </>
  );
}
