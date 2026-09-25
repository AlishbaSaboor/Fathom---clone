import { analyzeRecording } from "@/lib/gemini/analyze";
import { GeminiError } from "@/lib/gemini/errors";
import { completeMeeting, getPending } from "@/lib/meetings";
import type { ProcessResponse } from "@/lib/recordings/types";
import { enforceRateLimit, errorResponse, json, readJson } from "@/lib/server/api";
import { requireOwnerId } from "@/lib/server/owner";

// Step 3: one Gemini call that returns the transcript, title, summary and
// action items, which are then saved to the database. Gemini can take 30-40s
// (longer when it is overloaded and this has to retry), so allow the maximum a
// Hobby-plan function may run.
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, "process", 6, 10 * 60_000);
    const ownerId = await requireOwnerId();
    const { meetingId } = await readJson(request, 10_000);
    if (typeof meetingId !== "string") throw new GeminiError("invalid_input");

    // Everything about the recording comes from the record made in step 1, not from this request.
    const doc = await getPending(meetingId, ownerId);
    if (!doc.geminiFileName) throw new GeminiError("not_found");

    const result = await analyzeRecording(doc.geminiFileName, doc.durationSec);
    await completeMeeting(doc, result);
    return json({ meetingId: doc._id, shareToken: doc.shareToken } satisfies ProcessResponse);
  } catch (e) {
    return errorResponse(e);
  }
}
