import type { Metadata } from "next";
import { MyCalls } from "@/components/meetings/MyCalls";
import { getMeetingList } from "@/lib/meetings";

export const metadata: Metadata = { title: "My Calls | Fathom Clone" };

export default async function MyCallsPage() {
  const meetings = await getMeetingList();

  return <MyCalls meetings={meetings} />;
}
