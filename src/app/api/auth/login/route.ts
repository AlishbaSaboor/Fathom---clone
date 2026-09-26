import { GeminiError } from "@/lib/gemini/errors";
import { claimAnonymousMeetings, createSession } from "@/lib/server/auth";
import { enforceRateLimit, errorResponse, json, readJson } from "@/lib/server/api";
import { checkRateLimit } from "@/lib/server/rateLimit";
import { verifyUserPassword } from "@/lib/server/users";

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, "auth-login", 15, 15 * 60_000);
    const { email, password } = await readJson(request, 5_000);
    if (typeof email !== "string" || typeof password !== "string") throw new GeminiError("invalid_input");
    const cleanEmail = email.trim().toLowerCase();

    // Also throttled per email, not just per IP: this is what actually slows down someone
    // rotating IPs to brute-force one specific account.
    const perEmail = checkRateLimit(`auth-login-email:${cleanEmail}`, 10, 15 * 60_000);
    if (!perEmail.ok) throw new GeminiError("rate_limited", `Too many attempts on this account. Please try again in ${perEmail.retryAfterSec} seconds.`);

    const user = await verifyUserPassword(cleanEmail, password);
    await createSession(user.id);
    await claimAnonymousMeetings(user.id);
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
