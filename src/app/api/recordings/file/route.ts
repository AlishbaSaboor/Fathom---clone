import { GeminiError } from "@/lib/gemini/errors";
import { getFile, isValidFileName } from "@/lib/gemini/files";
import type { FileStatusResponse } from "@/lib/recordings/types";
import { enforceRateLimit, errorResponse, json } from "@/lib/server/api";

// Step 2: the browser polls this until Gemini has finished preparing the
// uploaded file (video takes a few seconds; audio is usually instant). Polling
// from the browser, rather than waiting inside one long request, keeps each
// function invocation short.
export async function GET(request: Request) {
  try {
    enforceRateLimit(request, "file-status", 120, 60_000);
    const name = new URL(request.url).searchParams.get("name") ?? "";
    if (!isValidFileName(name)) throw new GeminiError("invalid_input", "That upload reference isn't valid.");
    const file = await getFile(name);
    return json({ name: file.name, state: file.state } satisfies FileStatusResponse);
  } catch (e) {
    return errorResponse(e);
  }
}
