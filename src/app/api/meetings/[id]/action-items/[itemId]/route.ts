import type { NextRequest } from "next/server";
import { GeminiError } from "@/lib/gemini/errors";
import { setActionItemDone } from "@/lib/meetings";
import { enforceRateLimit, errorResponse, json, readJson } from "@/lib/server/api";
import { requireOwnerId } from "@/lib/server/auth";

// Saves an action item's checkbox. Only the owner can change it; people
// viewing a share link see the state but have no way to alter it.
export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/meetings/[id]/action-items/[itemId]">) {
  try {
    enforceRateLimit(request, "action-item", 120, 10 * 60_000);
    const ownerId = await requireOwnerId();
    const { id, itemId } = await ctx.params;
    const { done } = await readJson(request, 1_000);
    if (typeof done !== "boolean" || !/^a\d{2,4}$/.test(itemId)) throw new GeminiError("invalid_input");
    if (!(await setActionItemDone(id, ownerId, itemId, done))) throw new GeminiError("not_found", "That action item wasn't found.");
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
