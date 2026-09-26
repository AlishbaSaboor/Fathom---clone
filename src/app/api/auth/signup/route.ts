import { GeminiError } from "@/lib/gemini/errors";
import { claimAnonymousMeetings, createSession } from "@/lib/server/auth";
import { enforceRateLimit, errorResponse, json, readJson } from "@/lib/server/api";
import { createUserWithPassword } from "@/lib/server/users";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// At least 8 characters, one letter and one number — same bar as Next's own auth guide's example.
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/;

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, "auth-signup", 8, 15 * 60_000);
    const body = await readJson(request, 5_000);
    const { email, password, name } = body;
    if (typeof email !== "string" || typeof password !== "string" || typeof name !== "string") {
      throw new GeminiError("invalid_input");
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim().slice(0, 100);
    if (!EMAIL_RE.test(cleanEmail) || cleanEmail.length > 200) throw new GeminiError("invalid_input", "Enter a valid email address.");
    if (!cleanName) throw new GeminiError("invalid_input", "Enter your name.");
    if (!PASSWORD_RE.test(password)) {
      throw new GeminiError("invalid_input", "Password must be at least 8 characters and include a letter and a number.");
    }

    const user = await createUserWithPassword(cleanEmail, password, cleanName);
    await createSession(user.id);
    await claimAnonymousMeetings(user.id);
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
