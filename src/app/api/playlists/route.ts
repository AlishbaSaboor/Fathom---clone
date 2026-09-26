import { GeminiError } from "@/lib/gemini/errors";
import { createPlaylist } from "@/lib/playlists";
import { enforceRateLimit, errorResponse, json, readJson } from "@/lib/server/api";
import { requireOwnerId } from "@/lib/server/auth";

// Creates a new, empty playlist for the visitor's own account.
export async function POST(request: Request) {
  try {
    enforceRateLimit(request, "create-playlist", 20, 10 * 60_000);
    const ownerId = await requireOwnerId();
    const { name } = await readJson(request, 1_000);
    if (typeof name !== "string") throw new GeminiError("invalid_input");
    const playlist = await createPlaylist(ownerId, name);
    return json(playlist);
  } catch (e) {
    return errorResponse(e);
  }
}
