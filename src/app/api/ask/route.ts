import { askAboutMeeting } from "@/lib/gemini/ask";
import { GeminiError } from "@/lib/gemini/errors";
import { transcriptToText } from "@/lib/export";
import { getMeetingById } from "@/lib/meetings";
import type { AskResponse } from "@/lib/recordings/types";
import { enforceRateLimit, errorResponse, json, readJson } from "@/lib/server/api";

export const maxDuration = 120;

// Ask Fathom. Seeded meetings are looked up by id, so the browser never sends
// their transcript. Uploaded meetings only exist in the visitor's browser, so
// their transcript comes with the request (size-capped in askAboutMeeting).
export async function POST(request: Request) {
  try {
    enforceRateLimit(request, "ask", 20, 60_000);
    const body = await readJson(request, 400_000);
    const { meetingId, transcript, question, history } = body;
    if (typeof question !== "string") throw new GeminiError("invalid_input");

    let transcriptText: string;
    if (typeof meetingId === "string") {
      const meeting = await getMeetingById(meetingId);
      if (!meeting) throw new GeminiError("not_found", "That meeting wasn't found.");
      transcriptText = transcriptToText(meeting);
    } else if (typeof transcript === "string") {
      transcriptText = transcript;
    } else {
      throw new GeminiError("invalid_input");
    }

    const turns = Array.isArray(history)
      ? history
          .filter((t): t is { role: "user" | "assistant"; text: string } =>
            !!t && typeof t === "object" && (t.role === "user" || t.role === "assistant") && typeof t.text === "string",
          )
      : [];

    const { answer } = await askAboutMeeting({ transcriptText, question, history: turns });
    return json({ answer } satisfies AskResponse);
  } catch (e) {
    return errorResponse(e);
  }
}
