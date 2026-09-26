import type { Metadata } from "next";
import { MyCalls } from "@/components/meetings/MyCalls";
import { getMeetingList } from "@/lib/meetings";
import { requireUser } from "@/lib/server/auth";

export const metadata: Metadata = { title: "My Calls | Fathom Clone" };

// Reads the visitor's own recordings from the database on every request; the
// session (which makes this page dynamic) says whose they are. requireUser()
// redirects to /login on its own if the session isn't valid — proxy.ts already
// does this too, but a page must never rely on that alone (see lib/server/auth.ts).
export default async function MyCallsPage() {
  const user = await requireUser();
  const meetings = await getMeetingList(user.id);

  return <MyCalls meetings={meetings} />;
}
