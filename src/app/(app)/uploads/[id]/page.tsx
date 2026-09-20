import type { Metadata } from "next";
import { UploadedMeetingView } from "@/components/upload/UploadedMeetingView";

export const metadata: Metadata = { title: "Uploaded recording | Fathom Clone" };

// Uploaded recordings live only in the visitor's browser (localStorage and
// IndexedDB), so the server cannot know which ids exist and there is nothing to
// prerender. This route just hands the id to a client component that looks it up.
export default async function UploadedMeetingPage({ params }: PageProps<"/uploads/[id]">) {
  const { id } = await params;
  return <UploadedMeetingView id={id} />;
}
