import { GeminiError } from "@/lib/gemini/errors";
import { removeMeetingFromPlaylist } from "@/lib/playlists";
import { enforceRateLimit, errorResponse, json } from "@/lib/server/api";
import { requireOwnerId } from "@/lib/server/auth";

// Removes a recording from one of the visitor's own playlists. The recording itself is untouched.
export async function DELETE(request: Request, ctx: RouteContext<"/api/playlists/[id]/meetings/[meetingId]">) {
  try {
    enforceRateLimit(request, "remove-from-playlist", 60, 10 * 60_000);
    const ownerId = await requireOwnerId();
    const { id, meetingId } = await ctx.params;
    if (!(await removeMeetingFromPlaylist(id, ownerId, meetingId))) throw new GeminiError("not_found", "That playlist wasn't found.");
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
