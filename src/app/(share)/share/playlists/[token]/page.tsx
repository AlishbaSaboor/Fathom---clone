import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { MeetingCardBody } from "@/components/meetings/MeetingCardBody";
import { getPlaylistByShareToken } from "@/lib/playlists";

// Public, read-only view of a playlist: its name and the recordings in it, each
// opening its own real /share/[token] page — nothing here is rebuilt. Possession
// of the token is the entire access check, exactly like a meeting's own share
// link. Rendered on demand; an unknown token is a 404.
export const dynamic = "force-dynamic";

const getShared = cache((token: string) => getPlaylistByShareToken(token));

export async function generateMetadata({ params }: PageProps<"/share/playlists/[token]">): Promise<Metadata> {
  const { token } = await params;
  const playlist = await getShared(token);
  return {
    title: playlist ? `${playlist.name} (shared playlist) | Fathom AI` : "Shared playlist not found",
    robots: { index: false, follow: false },
  };
}

export default async function SharedPlaylistPage({ params }: PageProps<"/share/playlists/[token]">) {
  const { token } = await params;
  const playlist = await getShared(token);
  if (!playlist) notFound();

  return (
    <div className="text-[#201D1A] dark:text-[#F3F4F6]">
      <h1 className="text-2xl font-bold tracking-tight text-[#201D1A] dark:text-[#F3F4F6] sm:text-3xl">{playlist.name}</h1>
      <p className="mt-1 text-sm text-[#201D1A]/60 dark:text-[#F3F4F6]/60">
        {playlist.meetings.length} {playlist.meetings.length === 1 ? "recording" : "recordings"}
      </p>

      {playlist.meetings.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-[#201D1A]/20 p-10 text-center text-sm text-[#201D1A]/60 dark:border-white/20 dark:text-[#F3F4F6]/60">
          This playlist is empty.
        </p>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {playlist.meetings.map((meeting) => (
            <li key={meeting.id} className="flex">
              <Link
                href={`/share/${meeting.shareToken}`}
                className="flex w-full flex-col overflow-hidden rounded-2xl border border-[#201D1A]/10 bg-white shadow-xs transition hover:border-[#201D1A]/20 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6E56] dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20"
              >
                <MeetingCardBody meeting={meeting} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
