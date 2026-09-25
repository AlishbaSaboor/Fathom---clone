import { askAcrossCalls, parseAskAllBody } from "@/lib/gemini/askAll";
import { getMeetingsForAsk } from "@/lib/meetings";
import type { AskAllResponse } from "@/lib/recordings/types";
import { enforceRateLimit, errorResponse, json, readJson } from "@/lib/server/api";
import { requireOwnerId } from "@/lib/server/owner";

export const maxDuration = 120;

// Account-level Ask Fathom (My Calls): a question across all of the visitor's
// own calls. The server reads their calls from the database and digests them
// (summaries and action items, never transcripts, so the request stays small);
// the browser sends only the question and the conversation so far.
export async function POST(request: Request) {
  try {
    enforceRateLimit(request, "ask-all", 20, 60_000);
    const ownerId = await requireOwnerId();
    const body = await readJson(request, 100_000);
    const meetings = await getMeetingsForAsk(ownerId);
    const { answer, followUps, analyzed } = await askAcrossCalls(parseAskAllBody(body), meetings);
    return json({ answer, followUps, analyzed } satisfies AskAllResponse);
  } catch (e) {
    return errorResponse(e);
  }
}
