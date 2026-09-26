import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import { PlaylistsView } from "@/components/playlists/PlaylistsView";
import { getPlaylistsForOwner } from "@/lib/playlists";
import { requireUser } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Playlists | Fathom Clone" };

/**
 * The visitor's own playlists. Its own shell (not a shared layout.tsx) because,
 * unlike this list page, /playlists/[id] must not show the nav row — matching
 * how /meetings/[id] differs from /calls (see app/playlists/[id]/page.tsx).
 * Explicit force-dynamic, matching /playlists/[id]: this reads the session and
 * must never serve a cached list from before a playlist was created or deleted.
 */
export const dynamic = "force-dynamic";

export default async function PlaylistsPage() {
  const user = await requireUser();
  const playlists = await getPlaylistsForOwner(user.id);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#201D1A] dark:bg-[#0B0F19] dark:text-[#F3F4F6]">
      <AppHeader user={user} showNav />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <PlaylistsView playlists={playlists} />
      </main>
    </div>
  );
}
