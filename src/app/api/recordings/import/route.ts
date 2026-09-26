import { GeminiError } from "@/lib/gemini/errors";
import { importToGemini } from "@/lib/gemini/files";
import { attachUpload, setGeminiFile } from "@/lib/meetings";
import type { ImportResponse } from "@/lib/recordings/types";
import { enforceRateLimit, errorResponse, json, readJson } from "@/lib/server/api";
import { requireOwnerId } from "@/lib/server/auth";

// Step 2 of an upload: the recording is now in Blob. Confirm that, record its
// URL, and copy it to Gemini (server to server, streamed) so it can be
// transcribed. Streaming up to 200 MB can take a while, so allow the maximum a
// Hobby-plan function may run.
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, "import", 10, 10 * 60_000);
    const ownerId = await requireOwnerId();
    const { meetingId } = await readJson(request, 10_000);
    if (typeof meetingId !== "string") throw new GeminiError("invalid_input");

    const doc = await attachUpload(meetingId, ownerId);
    const fileName = await importToGemini({
      sourceUrl: doc.media.url!,
      mimeType: doc.media.geminiMimeType,
      sizeBytes: doc.media.sizeBytes,
    });
    await setGeminiFile(meetingId, ownerId, fileName);
    return json({ fileName } satisfies ImportResponse);
  } catch (e) {
    return errorResponse(e);
  }
}
