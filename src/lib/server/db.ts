import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { MongoClient, type Collection, type ObjectId } from "mongodb";
import { GeminiError } from "@/lib/gemini/errors";
import type { Attendee, SummarySet, TranscriptSegment } from "@/types/meeting";

// MongoDB Atlas is the primary database: meetings, transcripts and action
// items live here. The recording files do not; a meeting stores only the URL of
// its file in Vercel Blob (see lib/server/blob.ts).
//
//   meetings     one per recording. Attendees and the summary are embedded: they are
//                small, belong to one meeting, and are always read with it.
//   transcripts  one per meeting (_id = the meeting id). Kept apart because it is
//                the largest part (about 50 KB for 30 minutes) and the list page and
//                account-level Ask Fathom never need it.
//   actionItems  one per item, so the "done" checkbox can be saved on its own.
//   users        one per account (see lib/server/users.ts). A user may sign in with a
//                password, Google, or both once linked.
//   sessions     one per signed-in session (see lib/server/auth.ts). The cookie holds
//                only a signed reference to a row here, so logout (or a future "log out
//                everywhere") can really revoke it, not just clear the browser's cookie.
//   playlists    one per playlist (see lib/playlists.ts). Holds only membership (meeting
//                ids); titles/posters/etc. are always read live from meetings, so a
//                deleted recording just drops out rather than needing active cleanup.

export interface MeetingDoc {
  /** The meeting id used in the app's own URLs. */
  _id: string;
  /** The signed-in user this recording belongs to (a user id; see lib/server/auth.ts). Never sent to the browser. */
  ownerId: string;
  /** Opaque token in the public share link. Possession of it is the access check. */
  shareToken: string;
  /** "uploading" from the moment the file is registered until analysis is saved. Only "ready" meetings are listed. */
  status: "uploading" | "ready";
  createdAt: Date;
  title: string;
  /** ISO 8601. */
  date: string;
  durationSec: number;
  poster: { from: string; to: string };
  media: {
    /** Where the file was registered to be stored in Blob. Chosen by the server, contains no owner id. */
    pathname: string;
    /** Public URL of the stored file. Set once the upload is verified. */
    url?: string;
    fileName: string;
    /** Type the file is stored and played with (audio/mpeg). */
    mimeType: string;
    /** Type Gemini is told (audio/mp3). */
    geminiMimeType: string;
    sizeBytes: number;
  };
  /** The copy of the file held by Gemini while it is analyzed. */
  geminiFileName?: string;
  attendees?: Attendee[];
  summaries?: SummarySet;
  /** Set once alongside `summaries`; the app never adds or removes an action item afterward, so this never goes stale. */
  actionItemCount?: number;
  model?: string;
}

export interface TranscriptDoc {
  _id: string;
  segments: TranscriptSegment[];
}

export interface ActionItemDoc {
  _id?: ObjectId;
  meetingId: string;
  ownerId: string;
  /** Unique within its meeting ("a01"). */
  id: string;
  text: string;
  /** Attendee id; "" when unassigned. */
  assigneeId: string;
  timestamp: number;
  done: boolean;
}

export interface UserDoc {
  /** A user id (also stored as `ownerId` on their meetings and action items). */
  _id: string;
  email: string;
  name: string;
  /** `scrypt:saltHex:hashHex`, or null for a Google-only account. */
  passwordHash: string | null;
  /** Google's stable subject id, or null until linked. */
  googleId: string | null;
  createdAt: Date;
}

export interface SessionDoc {
  _id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface PlaylistDoc {
  _id: string;
  ownerId: string;
  name: string;
  /** Membership only; resolved against `meetings` on every read. */
  meetingIds: string[];
  /** Opaque token in the public share link (see /share/playlists/[token]). */
  shareToken: string;
  createdAt: Date;
}

export interface Collections {
  meetings: Collection<MeetingDoc>;
  transcripts: Collection<TranscriptDoc>;
  actionItems: Collection<ActionItemDoc>;
  users: Collection<UserDoc>;
  sessions: Collection<SessionDoc>;
  playlists: Collection<PlaylistDoc>;
}

// One client per server instance, reused across requests. attachDatabasePool
// lets Vercel close idle connections before an instance is suspended.
const g = globalThis as { __mongo?: Promise<MongoClient>; __mongoIndexes?: Promise<void> };

/** A first connection from a cold instance can fail transiently, so it is tried twice, each time with a fresh client. */
async function connect(uri: string): Promise<MongoClient> {
  let last: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const c = new MongoClient(uri, { maxPoolSize: 5, connectTimeoutMS: 8_000, serverSelectionTimeoutMS: 8_000 });
    try {
      await c.connect();
      attachDatabasePool(c);
      return c;
    } catch (e) {
      last = e;
      await c.close().catch(() => undefined);
    }
  }
  throw last;
}

function client(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new GeminiError("storage_unavailable", "The database isn't configured. Add MONGODB_URI to .env.local (or the Vercel project's environment variables) and restart.");
  g.__mongo ??= connect(uri).catch((e) => {
    g.__mongo = undefined; // let the next request try again
    throw e;
  });
  return g.__mongo;
}

/** The three collections, with their indexes in place. Any failure to reach the database becomes a retryable API error. */
export async function collections(): Promise<Collections> {
  try {
    const db = (await client()).db(process.env.MONGODB_DB?.trim() || undefined);
    const c: Collections = {
      meetings: db.collection<MeetingDoc>("meetings"),
      transcripts: db.collection<TranscriptDoc>("transcripts"),
      actionItems: db.collection<ActionItemDoc>("actionItems"),
      users: db.collection<UserDoc>("users"),
      sessions: db.collection<SessionDoc>("sessions"),
      playlists: db.collection<PlaylistDoc>("playlists"),
    };
    g.__mongoIndexes ??= Promise.all([
      c.meetings.createIndex({ ownerId: 1, status: 1, date: -1 }),
      c.meetings.createIndex({ shareToken: 1 }, { unique: true }),
      c.meetings.createIndex({ status: 1, createdAt: 1 }),
      c.actionItems.createIndex({ meetingId: 1, id: 1 }, { unique: true }),
      c.actionItems.createIndex({ ownerId: 1, done: 1 }),
      c.users.createIndex({ email: 1 }, { unique: true }),
      c.users.createIndex({ googleId: 1 }, { unique: true, sparse: true }),
      // TTL index: Mongo removes a session on its own once expired, so logged-out sessions don't pile up.
      c.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      c.playlists.createIndex({ ownerId: 1, createdAt: -1 }),
      c.playlists.createIndex({ shareToken: 1 }, { unique: true }),
    ]).then(() => undefined);
    await g.__mongoIndexes.catch((e) => {
      g.__mongoIndexes = undefined;
      throw e;
    });
    return c;
  } catch (e) {
    if (e instanceof GeminiError) throw e;
    // The name only: an error message can quote the connection string.
    console.error("[db] could not reach the database:", (e as Error)?.name ?? "unknown");
    throw new GeminiError("storage_unavailable");
  }
}
