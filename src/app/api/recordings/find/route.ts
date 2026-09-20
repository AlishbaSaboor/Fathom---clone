import { GeminiError } from "@/lib/gemini/errors";
import { TOKEN_PATTERN, findFileByToken } from "@/lib/gemini/files";
import type { FileStatusResponse } from "@/lib/recordings/types";
import { enforceRateLimit, errorResponse, json } from "@/lib/server/api";

// After the browser has sent a recording to Gemini it cannot read Gemini's reply
// (that reply has no CORS header), so it asks here for the file's name, using
// the random token that start-upload put in the file's display name.
export async function GET(request: Request) {
  try {
    enforceRateLimit(request, "find-file", 120, 60_000);
    const token = new URL(request.url).searchParams.get("token") ?? "";
    if (!TOKEN_PATTERN.test(token)) throw new GeminiError("invalid_input", "That upload reference isn't valid.");
    const file = await findFileByToken(token);
    return json({ name: file.name, state: file.state } satisfies FileStatusResponse);
  } catch (e) {
    return errorResponse(e);
  }
}
