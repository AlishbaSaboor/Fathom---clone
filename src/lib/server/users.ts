import "server-only";
import { randomUUID } from "node:crypto";
import { GeminiError } from "@/lib/gemini/errors";
import { collections, type UserDoc } from "@/lib/server/db";
import type { GoogleIdentity } from "@/lib/server/googleOAuth";
import { hashPassword, verifyPassword } from "@/lib/server/password";

export interface PublicUser {
  id: string;
  email: string;
  name: string;
}

const toPublic = (doc: Pick<UserDoc, "_id" | "email" | "name">): PublicUser => ({ id: doc._id, email: doc.email, name: doc.name });

export async function createUserWithPassword(email: string, password: string, name: string): Promise<PublicUser> {
  const c = await collections();
  const doc: UserDoc = {
    _id: randomUUID(),
    email,
    name,
    passwordHash: await hashPassword(password),
    googleId: null,
    createdAt: new Date(),
  };
  try {
    await c.users.insertOne(doc);
  } catch {
    // Almost always the unique index on email: either a prior findOne missed a race, or this is a duplicate.
    throw new GeminiError("email_taken");
  }
  return toPublic(doc);
}

export async function verifyUserPassword(email: string, password: string): Promise<PublicUser> {
  const c = await collections();
  const doc = await c.users.findOne({ email });
  const ok = await verifyPassword(password, doc?.passwordHash ?? null);
  if (!doc || !ok) throw new GeminiError("invalid_credentials");
  return toPublic(doc);
}

/** First Google sign-in with this email links the Google account to it, rather than creating a second account. */
export async function findOrCreateGoogleUser(identity: GoogleIdentity): Promise<PublicUser> {
  const c = await collections();
  const byGoogle = await c.users.findOne({ googleId: identity.googleId });
  if (byGoogle) return toPublic(byGoogle);

  const byEmail = await c.users.findOne({ email: identity.email });
  if (byEmail) {
    await c.users.updateOne({ _id: byEmail._id }, { $set: { googleId: identity.googleId } });
    return toPublic(byEmail);
  }

  const doc: UserDoc = {
    _id: randomUUID(),
    email: identity.email,
    name: identity.name,
    passwordHash: null,
    googleId: identity.googleId,
    createdAt: new Date(),
  };
  try {
    await c.users.insertOne(doc);
  } catch {
    // Lost a race with another sign-in for the same email/googleId; the row now exists, so read it back.
    const existing = await c.users.findOne({ $or: [{ googleId: identity.googleId }, { email: identity.email }] });
    if (existing) return toPublic(existing);
    throw new GeminiError("oauth_failed");
  }
  return toPublic(doc);
}
