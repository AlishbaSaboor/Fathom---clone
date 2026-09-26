import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { GeminiError } from "@/lib/gemini/errors";

// The cookie itself only ever holds a signed, expiring reference to a row in the
// `sessions` collection (see lib/server/auth.ts) — never the user id directly, and
// never anything a client could forge into a valid session. Kept in its own file,
// free of any database import, so proxy.ts can use it for a fast, DB-free redirect
// check (see the Proxy/Optimistic-checks guidance in Next's own auth docs).

export const SESSION_COOKIE = "fathom_session";
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new GeminiError("config", "This server has no session secret configured. Add AUTH_SECRET to .env.local (generate one with `openssl rand -base64 32`) and restart.");
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(sessionId: string, expiresAt: Date): Promise<string> {
  return new SignJWT({ sid: sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(secretKey());
}

/** The session id inside a cookie value, once its signature and expiry check out. Never trusts an unverified token. */
export async function verifySessionToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return typeof payload.sid === "string" ? payload.sid : null;
  } catch {
    return null; // missing, expired, or tampered with
  }
}
