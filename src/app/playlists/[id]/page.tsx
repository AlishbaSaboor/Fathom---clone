import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { AppHeader } from "@/components/AppHeader";
import { PlaylistDetail } from "@/components/playlists/PlaylistDetail";
import { getMeetingList } from "@/lib/meetings";
import { getPlaylistForOwner } from "@/lib/playlists";
import { requireUser } from "@/lib/server/auth";

// The owner's view of one of their playlists. No nav row here, unlike /playlists
// itself — same treatment as /meetings/[id] versus /calls.
export const dynamic = "force-dynamic";

// One database read per request, shared by generateMetadata and the page.
const getData = cache(async (id: string) => {
  const user = await requireUser();
  const [playlist, allMeetings] = await Promise.all([getPlaylistForOwner(id, user.id), getMeetingList(user.id)]);
  return { user, playlist, allMeetings };
});

export async function generateMetadata({ params }: PageProps<"/playlists/[id]">): Promise<Metadata> {
  const { id } = await params;
  const { playlist } = await getData(id);
  return { title: playlist ? `${playlist.name} | Fathom Clone` : "Playlist not found" };
}

export default async function PlaylistPage({ params, searchParams }: PageProps<"/playlists/[id]">) {
  const { id } = await params;
  const { add } = await searchParams;
  const { user, playlist, allMeetings } = await getData(id);
  if (!playlist) notFound();

  const inPlaylist = new Set(playlist.meetings.map((m) => m.id));
  const availableMeetings = allMeetings.filter((m) => !inPlaylist.has(m.id));

  return (
    <div className="min-h-screen bg-white text-[#2B241C] dark:bg-[#101B33] dark:text-[#F2EDDD]">
      <AppHeader user={user} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          href="/playlists"
          className="mb-4 inline-flex items-center gap-1 text-sm text-[#2B241C]/60 hover:text-[#2B241C] dark:text-[#F2EDDD]/60 dark:hover:text-[#F2EDDD]"
        >
          <span aria-hidden>←</span> Playlists
        </Link>
        <PlaylistDetail
          id={playlist.id}
          name={playlist.name}
          shareToken={playlist.shareToken}
          meetings={playlist.meetings}
          availableMeetings={availableMeetings}
          autoOpenAdd={add === "1"}
        />
      </main>
    </div>
  );
}
