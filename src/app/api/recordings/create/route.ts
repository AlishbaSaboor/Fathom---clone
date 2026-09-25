import { GeminiError } from "@/lib/gemini/errors";
import { registerUpload } from "@/lib/meetings";
import type { CreateUploadResponse } from "@/lib/recordings/types";
import { enforceRateLimit, errorResponse, json, readJson } from "@/lib/server/api";
import { requireOwnerId } from "@/lib/server/owner";

// Step 1 of an upload. Registers the recording (type, size, length and the
// storage limits are checked here, on the server) and tells the browser the
// Blob pathname to upload it to. The file itself never passes through this function.
export async function POST(request: Request) {
  try {
    enforceRateLimit(request, "create-upload", 10, 10 * 60_000);
    const ownerId = await requireOwnerId();
    const { fileName, browserType, sizeBytes, durationSec } = await readJson(request, 10_000);
    if (typeof fileName !== "string" || typeof sizeBytes !== "number" || typeof durationSec !== "number") {
      throw new GeminiError("invalid_input");
    }
    const { id, pathname, contentType } = await registerUpload({
      ownerId,
      fileName,
      browserType: typeof browserType === "string" ? browserType : "",
      sizeBytes,
      durationSec,
    });
    return json({ meetingId: id, pathname, contentType } satisfies CreateUploadResponse);
  } catch (e) {
    return errorResponse(e);
  }
}
