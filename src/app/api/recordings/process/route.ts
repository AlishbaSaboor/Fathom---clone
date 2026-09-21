import { analyzeRecording } from "@/lib/gemini/analyze";
import { GeminiError } from "@/lib/gemini/errors";
import { isValidFileName } from "@/lib/gemini/files";
import { buildMeeting } from "@/lib/recordings/toMeeting";
import { enforceRateLimit, errorResponse, json, readJson } from "@/lib/server/api";
import { saveUploadShare } from "@/lib/uploadShare";

// Step 3: one Gemini call that returns the transcript, title, summary and
// action items. Gemini can take 30-40s (longer when it is overloaded and this
// has to retry), so allow the maximum a Hobby-plan function may run.
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, "process", 6, 10 * 60_000);
    const body = await readJson(request, 10_000);
    const { fileName, durationSec } = body;
    if (typeof fileName !== "string" || !isValidFileName(fileName) || typeof durationSec !== "number") {
      throw new GeminiError("invalid_input");
    }
    const result = await analyzeRecording(fileName, durationSec);
    // Store a shareable copy of the RESULT (never the recording) and hand back its token. The result is built
    // here on the server, so nothing a client sends ends up in the store. If the store is unavailable the
    // user still gets their transcript, just without a link.
    const shareToken = await saveUploadShare(
      buildMeeting(result, { id: "shared", createdAt: new Date().toISOString(), durationSec, fileName: "", mimeType: "", sizeBytes: 0 }),
    );
    return json(shareToken ? { ...result, shareToken } : result);
  } catch (e) {
    return errorResponse(e);
  }
}
