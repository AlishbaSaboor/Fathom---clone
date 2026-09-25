import { askAboutMeeting } from "@/lib/gemini/ask";
import { GeminiError } from "@/lib/gemini/errors";
import { transcriptToText } from "@/lib/export";
import { getMeetingByShareToken } from "@/lib/meetings";
import type { AskResponse } from "@/lib/recordings/types";
import { enforceRateLimit, errorResponse, json, readJson } from "@/lib/server/api";

export const maxDuration = 120;

// Ask Fathom on one call. The call is identified by its share token, so the
// same route serves the owner and anyone viewing the share link (possession of
// the token is the access check, as on the share page), and the browser never
// sends a transcript: the server reads it from the database.
export async function POST(request: Request) {
  try {
    enforceRateLimit(request, "ask", 20, 60_000);
    const body = await readJson(request, 100_000);
    const { shareToken, question, history } = body;
    if (typeof question !== "string" || typeof shareToken !== "string") throw new GeminiError("invalid_input");

    const meeting = await getMeetingByShareToken(shareToken);
    if (!meeting) throw new GeminiError("not_found", "That meeting wasn't found.");

    const turns = Array.isArray(history)
      ? history
          .filter((t): t is { role: "user" | "assistant"; text: string } =>
            !!t && typeof t === "object" && (t.role === "user" || t.role === "assistant") && typeof t.text === "string",
          )
      : [];

    const { answer } = await askAboutMeeting({ transcriptText: transcriptToText(meeting), question, history: turns });
    return json({ answer } satisfies AskResponse);
  } catch (e) {
    return errorResponse(e);
  }
}
