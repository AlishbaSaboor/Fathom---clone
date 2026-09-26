import type { NextRequest } from "next/server";
import { GeminiError } from "@/lib/gemini/errors";
import { deletePlaylist } from "@/lib/playlists";
import { enforceRateLimit, errorResponse, json } from "@/lib/server/api";
import { requireOwnerId } from "@/lib/server/auth";

// Deletes one of the visitor's own playlists. The recordings in it are untouched.
export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/playlists/[id]">) {
  try {
    enforceRateLimit(request, "delete-playlist", 30, 10 * 60_000);
    const ownerId = await requireOwnerId();
    const { id } = await ctx.params;
    if (!(await deletePlaylist(id, ownerId))) throw new GeminiError("not_found", "That playlist wasn't found.");
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
