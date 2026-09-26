import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { GeminiError } from "@/lib/gemini/errors";
import { getMeetingListItemsByIds, isMeetingId, isShareToken } from "@/lib/meetings";
import { collections, type PlaylistDoc } from "@/lib/server/db";
import type { MeetingListItem, PlaylistSummary } from "@/types/meeting";

// A playlist stores only membership (an ordered list of meeting ids); title,
// poster, attendees etc. are always resolved live against `meetings`; see
// lib/server/db.ts. That means a deleted recording just quietly drops out of
// any playlist it was in, with nothing to actively clean up.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export const isPlaylistId = (value: string) => UUID.test(value);
export const isPlaylistShareToken = isShareToken;

const MAX_NAME_LENGTH = 100;

function toSummary(doc: PlaylistDoc): PlaylistSummary {
  return { id: doc._id, name: doc.name, meetingIds: doc.meetingIds, shareToken: doc.shareToken, createdAt: doc.createdAt.toISOString() };
}

/** Keeps meetings in the order they were added to the playlist, dropping any that no longer resolve. */
function orderMeetings(meetingIds: string[], resolved: MeetingListItem[]): MeetingListItem[] {
  const byId = new Map(resolved.map((m) => [m.id, m]));
  return meetingIds.map((id) => byId.get(id)).filter((m): m is MeetingListItem => !!m);
}

export async function createPlaylist(ownerId: string, name: string): Promise<PlaylistSummary> {
  const cleanName = name.trim().slice(0, MAX_NAME_LENGTH);
  if (!cleanName) throw new GeminiError("invalid_input", "Give the playlist a name.");

  const c = await collections();
  const doc: PlaylistDoc = {
    _id: randomUUID(),
    ownerId,
    name: cleanName,
    meetingIds: [],
    shareToken: randomBytes(16).toString("base64url"),
    createdAt: new Date(),
  };
  await c.playlists.insertOne(doc);
  return toSummary(doc);
}

/** The owner's playlists, newest first. */
export async function getPlaylistsForOwner(ownerId: string): Promise<PlaylistSummary[]> {
  const c = await collections();
  const docs = await c.playlists.find({ ownerId }).sort({ createdAt: -1 }).toArray();
  return docs.map(toSummary);
}

export interface PlaylistDetail {
  id: string;
  name: string;
  shareToken: string;
  meetings: MeetingListItem[];
}

/** The owner's own view of one playlist, with its recordings resolved. Someone else's id, or an unknown one, is "not found". */
export async function getPlaylistForOwner(id: string, ownerId: string): Promise<PlaylistDetail | null> {
  if (!isPlaylistId(id)) return null;
  const c = await collections();
  const doc = await c.playlists.findOne({ _id: id, ownerId });
  if (!doc) return null;
  const meetings = await getMeetingListItemsByIds(ownerId, doc.meetingIds);
  return { id: doc._id, name: doc.name, shareToken: doc.shareToken, meetings: orderMeetings(doc.meetingIds, meetings) };
}

export interface PublicPlaylist {
  name: string;
  meetings: MeetingListItem[];
}

/** The public version of a playlist. No login: possession of the token is the access check, exactly like a meeting's own share link. */
export async function getPlaylistByShareToken(token: string): Promise<PublicPlaylist | null> {
  if (!isPlaylistShareToken(token)) return null;
  const c = await collections();
  const doc = await c.playlists.findOne({ shareToken: token });
  if (!doc) return null;
  const meetings = await getMeetingListItemsByIds(doc.ownerId, doc.meetingIds);
  return { name: doc.name, meetings: orderMeetings(doc.meetingIds, meetings) };
}

/** Adds a meeting the caller owns to a playlist they own; idempotent. False if the playlist or the meeting isn't theirs. */
export async function addMeetingToPlaylist(playlistId: string, ownerId: string, meetingId: string): Promise<boolean> {
  if (!isPlaylistId(playlistId) || !isMeetingId(meetingId)) return false;
  const c = await collections();
  const owns = await c.meetings.findOne({ _id: meetingId, ownerId, status: "ready" }, { projection: { _id: 1 } });
  if (!owns) return false;
  const r = await c.playlists.updateOne({ _id: playlistId, ownerId }, { $addToSet: { meetingIds: meetingId } });
  return r.matchedCount > 0;
}

/** False if the playlist isn't the caller's own (removing a meeting id that was never a member is a harmless no-op, not an error). */
export async function removeMeetingFromPlaylist(playlistId: string, ownerId: string, meetingId: string): Promise<boolean> {
  if (!isPlaylistId(playlistId)) return false;
  const c = await collections();
  const r = await c.playlists.updateOne({ _id: playlistId, ownerId }, { $pull: { meetingIds: meetingId } });
  return r.matchedCount > 0;
}

export async function deletePlaylist(id: string, ownerId: string): Promise<boolean> {
  if (!isPlaylistId(id)) return false;
  const c = await collections();
  const r = await c.playlists.deleteOne({ _id: id, ownerId });
  return r.deletedCount > 0;
}
