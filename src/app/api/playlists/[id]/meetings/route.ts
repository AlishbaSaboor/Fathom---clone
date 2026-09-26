import type { NextRequest } from "next/server";
import { GeminiError } from "@/lib/gemini/errors";
import { addMeetingToPlaylist } from "@/lib/playlists";
import { enforceRateLimit, errorResponse, json, readJson } from "@/lib/server/api";
import { requireOwnerId } from "@/lib/server/auth";

// Adds one of the visitor's own recordings to one of their own playlists. Idempotent.
export async function POST(request: NextRequest, ctx: RouteContext<"/api/playlists/[id]/meetings">) {
  try {
    enforceRateLimit(request, "add-to-playlist", 60, 10 * 60_000);
    const ownerId = await requireOwnerId();
    const { id } = await ctx.params;
    const { meetingId } = await readJson(request, 1_000);
    if (typeof meetingId !== "string") throw new GeminiError("invalid_input");
    if (!(await addMeetingToPlaylist(id, ownerId, meetingId))) throw new GeminiError("not_found", "That playlist or recording wasn't found.");
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
