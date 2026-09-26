import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { GeminiError } from "@/lib/gemini/errors";
import { collections } from "@/lib/server/db";
import { SESSION_COOKIE, SESSION_DURATION_MS, signSessionToken, verifySessionToken } from "@/lib/server/session";

// The real, authoritative check: verifies the cookie's signature *and* that the
// session it names still exists in the database. proxy.ts does a cheaper,
// signature-only check for its redirect (see the "optimistic checks" pattern in
// Next's auth docs) — this is what every page and API route must call instead,
// per that same guidance, since proxy alone is never the real access check.

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

const readSession = cache(async (): Promise<AuthUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const sessionId = await verifySessionToken(token);
  if (!sessionId) return null;
  const c = await collections();
  const session = await c.sessions.findOne({ _id: sessionId, expiresAt: { $gt: new Date() } });
  if (!session) return null;
  const user = await c.users.findOne({ _id: session.userId });
  if (!user) return null;
  return { id: user._id, email: user.email, name: user.name };
});

/** The signed-in user, or null. */
export async function getUser(): Promise<AuthUser | null> {
  return readSession();
}

/** For pages that require a signed-in user: redirects to /login rather than rendering. */
export async function requireUser(): Promise<AuthUser> {
  const user = await readSession();
  if (!user) redirect("/login");
  return user;
}

/** For API routes that act on the visitor's own recordings (kept distinct from AuthUser since callers only ever need the id). */
export async function requireOwnerId(): Promise<string> {
  const user = await readSession();
  if (!user) throw new GeminiError("unauthorized");
  return user.id;
}

/** Creates a database-backed session and sets its cookie. Must run inside a Route Handler (cookies() is write-only there). */
export async function createSession(userId: string): Promise<void> {
  const c = await collections();
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await c.sessions.insertOne({ _id: sessionId, userId, createdAt: new Date(), expiresAt });
  const token = await signSessionToken(sessionId, expiresAt);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Revokes the current session in the database (a leaked cookie stops working immediately, not just in this browser) and clears the cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const sessionId = await verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (sessionId) {
    const c = await collections();
    await c.sessions.deleteOne({ _id: sessionId });
  }
  store.delete(SESSION_COOKIE);
}

// ---------- claiming pre-login anonymous recordings ----------

const ANON_COOKIE = "fathom_owner";
const isAnonId = (value: string | undefined): value is string =>
  !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);

/**
 * One-time migration for a browser that uploaded recordings before this account existed:
 * whatever is under its pre-login anonymous cookie becomes this user's. Call once, right
 * after createSession(), from a Route Handler (needs cookies() access).
 */
export async function claimAnonymousMeetings(userId: string): Promise<void> {
  const store = await cookies();
  const anonId = store.get(ANON_COOKIE)?.value;
  if (!isAnonId(anonId) || anonId === userId) return;
  const c = await collections();
  await Promise.all([
    c.meetings.updateMany({ ownerId: anonId }, { $set: { ownerId: userId } }),
    c.actionItems.updateMany({ ownerId: anonId }, { $set: { ownerId: userId } }),
  ]);
  store.delete(ANON_COOKIE);
}

/** Restricts a post-login redirect target to a real in-app path, never an absolute or protocol-relative URL (no open redirect). */
export function isSafeRedirect(path: string | null | undefined): path is string {
  return !!path && /^\/(calls|upload|meetings|playlists)(\/|$)/.test(path);
}
