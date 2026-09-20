import { askAcrossCalls, parseAskAllBody } from "@/lib/gemini/askAll";
import type { AskAllResponse } from "@/lib/recordings/types";
import { enforceRateLimit, errorResponse, json, readJson } from "@/lib/server/api";

export const maxDuration = 120;

// Account-level Ask Fathom (My Calls). Built-in calls are digested on the
// server; the visitor's uploaded calls arrive as digests, since they only exist
// in their browser. Digests are summaries, so the body stays small.
export async function POST(request: Request) {
  try {
    enforceRateLimit(request, "ask-all", 20, 60_000);
    const body = await readJson(request, 400_000);
    const { answer, followUps, analyzed } = await askAcrossCalls(parseAskAllBody(body));
    return json({ answer, followUps, analyzed } satisfies AskAllResponse);
  } catch (e) {
    return errorResponse(e);
  }
}
