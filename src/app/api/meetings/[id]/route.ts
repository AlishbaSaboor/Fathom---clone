import type { NextRequest } from "next/server";
import { GeminiError } from "@/lib/gemini/errors";
import { deleteMeeting } from "@/lib/meetings";
import { enforceRateLimit, errorResponse, json } from "@/lib/server/api";
import { requireOwnerId } from "@/lib/server/auth";

// Deletes one of the visitor's own recordings: its stored file, transcript,
// action items and share link. Only the owner (by cookie) can do this.
export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/meetings/[id]">) {
  try {
    enforceRateLimit(request, "delete-meeting", 30, 10 * 60_000);
    const ownerId = await requireOwnerId();
    const { id } = await ctx.params;
    if (!(await deleteMeeting(id, ownerId))) throw new GeminiError("not_found", "That recording wasn't found.");
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
