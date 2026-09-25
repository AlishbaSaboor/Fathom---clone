import type { Metadata } from "next";
import { MyCalls } from "@/components/meetings/MyCalls";
import { getMeetingList } from "@/lib/meetings";
import { getOwnerId } from "@/lib/server/owner";

export const metadata: Metadata = { title: "My Calls | Fathom Clone" };

// Reads the visitor's own recordings from the database on every request; the
// owner cookie (which makes this page dynamic) says whose they are.
export default async function MyCallsPage() {
  const meetings = await getMeetingList(await getOwnerId());

  return <MyCalls meetings={meetings} />;
}
