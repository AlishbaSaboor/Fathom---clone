import "server-only";
import { randomBytes } from "node:crypto";
import { toPublicMeeting } from "@/lib/publicMeeting";
import { kvConfigured, kvGet, kvSet } from "@/lib/server/kv";
import type { Meeting } from "@/types/meeting";

// Shareable copies of uploaded recordings. What is stored is the processed
// result only (title, attendees, transcript, summary, action items). The
// recording itself is never sent here: it stays in the uploader's browser.
//
// Access control is the same as the demo share links: possession of the token.
// The token is 128 random bits generated on the server, so it can't be guessed
// or enumerated. Entries expire after 30 days; there is deliberately no way to
// revoke one earlier.

export const SHARE_TTL_SEC = 30 * 24 * 60 * 60;
/** Upstash's free tier allows 1 MB per request; stay well under it. A 30-minute transcript is about 50 KB. */
const MAX_BYTES = 500_000;

const keyFor = (token: string) => `upload-share:v1:${token}`;

/** 16 random bytes as base64url is exactly 22 characters. */
export const isShareToken = (value: string) => /^[A-Za-z0-9_-]{22}$/.test(value);

/**
 * Stores a shareable copy and returns its token, or null when sharing is
 * unavailable (no store configured, entry too large, store unreachable). It
 * never throws: a failure here must not fail the transcription the user
 * already has, they just don't get a link.
 */
export async function saveUploadShare(meeting: Meeting): Promise<string | null> {
  if (!kvConfigured()) return null;
  const token = randomBytes(16).toString("base64url");
  const shared: Meeting = {
    ...toPublicMeeting(meeting),
    id: `shared-${token}`,
    shareToken: token,
    media: undefined, // the file name and size are local details
  };
  const json = JSON.stringify(shared);
  if (json.length > MAX_BYTES) return null;
  try {
    return (await kvSet(keyFor(token), json, SHARE_TTL_SEC)) ? token : null;
  } catch {
    console.error("[share] could not store the shareable copy");
    return null;
  }
}

/** The stored meeting, or null when the token is malformed, unknown or expired. Throws if the store itself is unreachable. */
export async function loadUploadShare(token: string): Promise<Meeting | null> {
  if (!isShareToken(token) || !kvConfigured()) return null;
  const raw = await kvGet(keyFor(token));
  if (!raw) return null;
  try {
    const m = JSON.parse(raw) as Meeting;
    const ok =
      m && typeof m === "object" && typeof m.id === "string" && typeof m.title === "string" &&
      Array.isArray(m.transcript) && Array.isArray(m.attendees) && Array.isArray(m.actionItems) &&
      Array.isArray(m.highlights) && Array.isArray(m.summaries?.general) && typeof m.durationSec === "number";
    // Sanitized again on the way out, whatever is in the store.
    return ok ? { ...toPublicMeeting(m), source: "upload", media: undefined } : null;
  } catch {
    return null;
  }
}
