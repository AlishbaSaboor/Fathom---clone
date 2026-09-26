import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { MAX_CALLS_IN_CONTEXT } from "@/lib/digest";
import { GeminiError } from "@/lib/gemini/errors";
import { deleteFile } from "@/lib/gemini/files";
import { toPublicMeeting } from "@/lib/publicMeeting";
import {
  MAX_DURATION_SEC,
  MAX_UPLOAD_BYTES,
  MIN_UPLOAD_BYTES,
  OWNER_STORAGE_CAP_BYTES,
  STALE_UPLOAD_MS,
  TOTAL_STORAGE_CAP_BYTES,
  exceedsDurationLimit,
  resolveMimeType,
  resolvePlaybackMime,
} from "@/lib/recordings/limits";
import { buildMeeting, coverageNotice, posterFor } from "@/lib/recordings/toMeeting";
import type { ProcessedRecording } from "@/lib/recordings/types";
import { formatDuration } from "@/lib/format";
import { deleteBlob, findUploaded } from "@/lib/server/blob";
import { collections, type ActionItemDoc, type Collections, type MeetingDoc } from "@/lib/server/db";
import type { Meeting, MeetingListItem, TranscriptSegment } from "@/types/meeting";

// Every read and write of meetings goes through this file, against MongoDB
// (see lib/server/db.ts for the collections). A recording's life:
//
//   registerUpload     the file is registered: a "uploading" meeting is created and
//                      the storage limits are checked. The browser then uploads the
//                      file to Blob under the pathname chosen here.
//   attachUpload       the file is found in Blob and its real size and URL recorded.
//   setGeminiFile      the copy Gemini is analyzing is remembered, so a retry does
//                      not upload again.
//   completeMeeting    the analysis is saved and the meeting becomes "ready".
//
// Access: the owner (a signed-in user, see lib/server/auth.ts) reaches a
// meeting by id; anyone with the share token reaches the public version.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export const isMeetingId = (value: string) => UUID.test(value);
/** 16 random bytes as base64url is exactly 22 characters. */
export const isShareToken = (value: string) => /^[A-Za-z0-9_-]{22}$/.test(value);

const wasntFound = () => new GeminiError("not_found", "That recording wasn't found. It may have been deleted, so please upload it again.");

// ---------- upload lifecycle ----------

/** Removes the files an unfinished or deleted meeting holds. False if the stored file could not be removed. */
async function releaseAssets(doc: MeetingDoc): Promise<boolean> {
  if (doc.geminiFileName) await deleteFile(doc.geminiFileName);
  return deleteBlob(doc.media.url ?? doc.media.pathname);
}

async function removeMeeting(c: Collections, id: string): Promise<void> {
  await Promise.all([c.transcripts.deleteOne({ _id: id }), c.actionItems.deleteMany({ meetingId: id })]);
  await c.meetings.deleteOne({ _id: id });
}

/** Uploads that never finished (closed tab, gave up after a failure) are removed with their files. */
async function sweepStale(c: Collections): Promise<void> {
  const stale = await c.meetings
    .find({ status: "uploading", createdAt: { $lt: new Date(Date.now() - STALE_UPLOAD_MS) } })
    .limit(20)
    .toArray();
  for (const doc of stale) {
    if (await releaseAssets(doc)) await removeMeeting(c, doc._id);
  }
}

export interface RegisterUploadInput {
  ownerId: string;
  fileName: string;
  browserType: string;
  sizeBytes: number;
  durationSec: number;
}

/**
 * Registers a recording about to be uploaded and returns where the browser must
 * put it. Everything the file is later trusted for (its type, its maximum size,
 * its location) is decided here, not by the upload request.
 */
export async function registerUpload(input: RegisterUploadInput): Promise<{ id: string; pathname: string; contentType: string }> {
  const geminiMimeType = resolveMimeType(input.fileName, input.browserType);
  const mimeType = resolvePlaybackMime(input.fileName, input.browserType);
  if (!geminiMimeType || !mimeType) throw new GeminiError("invalid_input", "That file type isn't supported.");
  if (!Number.isFinite(input.sizeBytes) || input.sizeBytes < MIN_UPLOAD_BYTES) {
    throw new GeminiError("invalid_input", "That file is empty or too small to be a recording.");
  }
  if (input.sizeBytes > MAX_UPLOAD_BYTES) throw new GeminiError("invalid_input", "That file is too large.");
  if (!Number.isFinite(input.durationSec) || input.durationSec <= 0 || exceedsDurationLimit(input.durationSec)) {
    throw new GeminiError("invalid_input", `That recording is too long. The limit is ${formatDuration(MAX_DURATION_SEC)}.`);
  }

  const c = await collections();
  await sweepStale(c);

  // Not atomic: two uploads registered in the same instant could both pass. The margin under the real 1 GB limit absorbs that.
  const [usage] = await c.meetings
    .aggregate<{ total: number; mine: number }>([
      {
        $group: {
          _id: null,
          total: { $sum: "$media.sizeBytes" },
          mine: { $sum: { $cond: [{ $eq: ["$ownerId", input.ownerId] }, "$media.sizeBytes", 0] } },
        },
      },
    ])
    .toArray();
  if ((usage?.total ?? 0) + input.sizeBytes > TOTAL_STORAGE_CAP_BYTES) throw new GeminiError("storage_full");
  if ((usage?.mine ?? 0) + input.sizeBytes > OWNER_STORAGE_CAP_BYTES) {
    throw new GeminiError(
      "storage_full",
      "You've reached the recording storage limit for this app. Delete an older recording to make room, then try again.",
    );
  }

  const id = randomUUID();
  const ext = (input.fileName.toLowerCase().split(".").pop() ?? "bin").replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
  // The pathname is what the file's public URL contains, so it must not contain anything private (no owner id).
  const pathname = `recordings/${randomBytes(16).toString("base64url")}.${ext}`;
  await c.meetings.insertOne({
    _id: id,
    ownerId: input.ownerId,
    shareToken: randomBytes(16).toString("base64url"),
    status: "uploading",
    createdAt: new Date(),
    title: "Uploaded recording",
    date: new Date().toISOString(),
    durationSec: Math.ceil(input.durationSec),
    poster: posterFor(id),
    media: { pathname, fileName: input.fileName.slice(0, 200), mimeType, geminiMimeType, sizeBytes: input.sizeBytes },
  });
  return { id, pathname, contentType: mimeType };
}

/** An unfinished meeting of this owner, or a "wasn't found" error. */
export async function getPending(id: string, ownerId: string): Promise<MeetingDoc> {
  if (!isMeetingId(id)) throw wasntFound();
  const c = await collections();
  const doc = await c.meetings.findOne({ _id: id, ownerId, status: "uploading" });
  if (!doc) throw wasntFound();
  return doc;
}

/** Whether the token route may issue an upload token: only for a file registered by this owner, at its registered pathname and size. */
export async function authorizeBlobUpload(id: string, ownerId: string, pathname: string): Promise<{ contentType: string; maxBytes: number }> {
  const doc = await getPending(id, ownerId);
  if (doc.media.pathname !== pathname || doc.media.url) throw new GeminiError("invalid_input");
  return { contentType: doc.media.mimeType, maxBytes: doc.media.sizeBytes };
}

/**
 * Confirms the file really is in Blob and records its URL and actual size. The
 * browser is not asked where the file is: the registered pathname is looked up.
 */
export async function attachUpload(id: string, ownerId: string): Promise<MeetingDoc> {
  const doc = await getPending(id, ownerId);
  const found = await findUploaded(doc.media.pathname);
  if (!found) throw wasntFound();
  if (found.size < MIN_UPLOAD_BYTES || found.size > MAX_UPLOAD_BYTES) {
    await deleteBlob(doc.media.pathname);
    throw new GeminiError("invalid_input", "That file is empty, too small or too large to be a recording.");
  }
  const c = await collections();
  await c.meetings.updateOne({ _id: id }, { $set: { "media.url": found.url, "media.sizeBytes": found.size } });
  return { ...doc, media: { ...doc.media, url: found.url, sizeBytes: found.size } };
}

export async function setGeminiFile(id: string, ownerId: string, name: string): Promise<void> {
  const c = await collections();
  await c.meetings.updateOne({ _id: id, ownerId, status: "uploading" }, { $set: { geminiFileName: name } });
}

/** Saves Gemini's analysis: transcript and action items first, then the meeting itself flips to "ready". */
export async function completeMeeting(doc: MeetingDoc, processed: ProcessedRecording): Promise<void> {
  if (!doc.media.url) throw wasntFound();
  const meeting = buildMeeting(processed, {
    id: doc._id,
    shareToken: doc.shareToken,
    createdAt: doc.date,
    durationSec: Math.max(doc.durationSec, processed.transcript.at(-1)?.start ?? 0),
    fileName: doc.media.fileName,
    mimeType: doc.media.mimeType,
    sizeBytes: doc.media.sizeBytes,
    mediaUrl: doc.media.url,
  });

  const c = await collections();
  // Replace rather than insert, so saving again after a partial failure cannot duplicate anything.
  await c.transcripts.replaceOne({ _id: doc._id }, { segments: meeting.transcript }, { upsert: true });
  await c.actionItems.deleteMany({ meetingId: doc._id });
  if (meeting.actionItems.length > 0) {
    await c.actionItems.insertMany(
      meeting.actionItems.map((a) => ({
        meetingId: doc._id,
        ownerId: doc.ownerId,
        id: a.id,
        text: a.text,
        assigneeId: a.assigneeId,
        timestamp: a.timestamp,
        done: false,
      })),
    );
  }
  await c.meetings.updateOne(
    { _id: doc._id },
    {
      $set: {
        status: "ready",
        title: meeting.title,
        durationSec: meeting.durationSec,
        attendees: meeting.attendees,
        summaries: meeting.summaries,
        actionItemCount: meeting.actionItems.length,
        model: processed.model,
      },
      $unset: { geminiFileName: "" },
    },
  );
}

// ---------- reading ----------

function assemble(doc: MeetingDoc, segments: TranscriptSegment[] | null, items: ActionItemDoc[]): Meeting {
  return {
    id: doc._id,
    shareToken: doc.shareToken,
    title: doc.title,
    date: doc.date,
    durationSec: doc.durationSec,
    poster: doc.poster,
    attendees: doc.attendees ?? [],
    transcript: segments ?? [],
    summaries: doc.summaries ?? { general: [] },
    actionItems: [...items]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((a) => ({ id: a.id, text: a.text, assigneeId: a.assigneeId, timestamp: a.timestamp, done: a.done })),
    // Worked out from the transcript on every load, so a change to how it is judged also corrects earlier meetings.
    notice: segments ? coverageNotice(segments, doc.durationSec) : undefined,
    media: { url: doc.media.url ?? "", fileName: doc.media.fileName, mimeType: doc.media.mimeType, sizeBytes: doc.media.sizeBytes },
  };
}

async function load(doc: MeetingDoc | null): Promise<Meeting | null> {
  if (!doc) return null;
  const c = await collections();
  const [transcript, items] = await Promise.all([
    c.transcripts.findOne({ _id: doc._id }),
    c.actionItems.find({ meetingId: doc._id }).toArray(),
  ]);
  return assemble(doc, transcript?.segments ?? [], items);
}

/** The owner's finished meetings, newest first. Transcripts are left out. */
export async function getMeetingList(ownerId: string | null): Promise<MeetingListItem[]> {
  if (!ownerId) return [];
  const c = await collections();
  const docs = await c.meetings
    .find(
      { ownerId, status: "ready" },
      { projection: { title: 1, date: 1, durationSec: 1, poster: 1, attendees: 1, shareToken: 1, actionItemCount: 1 } },
    )
    .sort({ date: -1 })
    .toArray();
  return docs.map((d) => ({
    id: d._id,
    title: d.title,
    date: d.date,
    durationSec: d.durationSec,
    poster: d.poster,
    attendees: d.attendees ?? [],
    shareToken: d.shareToken,
    actionItemCount: d.actionItemCount ?? 0,
  }));
}

export async function getMeetingForOwner(id: string, ownerId: string | null): Promise<Meeting | null> {
  if (!ownerId || !isMeetingId(id)) return null;
  const c = await collections();
  return load(await c.meetings.findOne({ _id: id, ownerId, status: "ready" }));
}

/** The public version of a meeting. No login: possession of the token is the access check. */
export async function getMeetingByShareToken(token: string): Promise<Meeting | null> {
  if (!isShareToken(token)) return null;
  const c = await collections();
  const meeting = await load(await c.meetings.findOne({ shareToken: token, status: "ready" }));
  return meeting && toPublicMeeting(meeting);
}

/** The owner's newest meetings with their summaries and action items but no transcripts, for account-level Ask Fathom. */
export async function getMeetingsForAsk(ownerId: string): Promise<Meeting[]> {
  const c = await collections();
  const docs = await c.meetings.find({ ownerId, status: "ready" }).sort({ date: -1 }).limit(MAX_CALLS_IN_CONTEXT).toArray();
  if (docs.length === 0) return [];
  const items = await c.actionItems.find({ meetingId: { $in: docs.map((d) => d._id) } }).toArray();
  return docs.map((d) => assemble(d, null, items.filter((i) => i.meetingId === d._id)));
}

// ---------- changing ----------

/** Deletes a meeting, its stored file and its share link. False if this owner has no such meeting. */
export async function deleteMeeting(id: string, ownerId: string): Promise<boolean> {
  if (!isMeetingId(id)) return false;
  const c = await collections();
  const doc = await c.meetings.findOne({ _id: id, ownerId });
  if (!doc) return false;
  // The file first: if it can't be removed the meeting stays, so it can be tried again and is never left uncounted in storage.
  if (!(await releaseAssets(doc))) throw new GeminiError("storage_unavailable");
  await removeMeeting(c, id);
  return true;
}

export async function setActionItemDone(meetingId: string, ownerId: string, itemId: string, done: boolean): Promise<boolean> {
  if (!isMeetingId(meetingId)) return false;
  const c = await collections();
  const r = await c.actionItems.updateOne({ meetingId, ownerId, id: itemId }, { $set: { done } });
  return r.matchedCount > 0;
}
