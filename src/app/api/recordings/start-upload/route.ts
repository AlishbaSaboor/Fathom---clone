import { startResumableUpload } from "@/lib/gemini/files";
import { GeminiError } from "@/lib/gemini/errors";
import type { StartUploadResponse } from "@/lib/recordings/types";
import { enforceRateLimit, errorResponse, json, readJson } from "@/lib/server/api";

// Step 1 of an upload. Validates the file's declared type and size, then asks
// Gemini to open a resumable upload session (the only step that needs the API
// key) and returns that session's URL. The browser sends the recording straight
// to Gemini, so it never passes through this function.
export async function POST(request: Request) {
  try {
    enforceRateLimit(request, "start-upload", 10, 10 * 60_000);
    const body = await readJson(request, 10_000);
    const { mimeType, sizeBytes } = body;
    if (typeof mimeType !== "string" || typeof sizeBytes !== "number") throw new GeminiError("invalid_input");
    const started = await startResumableUpload({ mimeType, sizeBytes });
    return json(started satisfies StartUploadResponse);
  } catch (e) {
    return errorResponse(e);
  }
}
