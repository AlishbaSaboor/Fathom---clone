"use client";

import { useSyncExternalStore } from "react";
import type { Meeting } from "@/types/meeting";
import { coverageNotice } from "./toMeeting";

// Uploaded meetings live only in this browser: there is no database, and on
// Vercel nothing in server memory survives between requests.
//   - localStorage holds the meeting JSON (transcript, summary, action items)
//   - IndexedDB holds the recording itself, because localStorage's ~5 MB cap
//     cannot hold audio or video, and playback needs the file after a reload

const KEY = "fathom-clone:uploads:v1";
const CHANGED = "fathom-uploads-changed";

export class StorageFullError extends Error {
  constructor() {
    super("Your browser's storage is full. Delete an uploaded recording and try again.");
  }
}

// ---------- meetings (localStorage) ----------

function parse(raw: string | null): Meeting[] {
  if (!raw) return [];
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list
      .filter(
        (m): m is Meeting =>
          !!m && typeof m.id === "string" && Array.isArray(m.transcript) && !!m.summaries?.general && m.source === "upload",
      )
      // The "transcript seems cut off" notice is worked out from the transcript each time an upload is loaded,
      // not trusted from storage, so a fix to how it is judged also corrects recordings saved earlier.
      .map((m) => ({ ...m, notice: coverageNotice(m.transcript, m.durationSec) }));
  } catch {
    return [];
  }
}

function read(): Meeting[] {
  try {
    return parse(localStorage.getItem(KEY));
  } catch {
    return []; // storage blocked (private mode, disabled cookies)
  }
}

function write(list: Meeting[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    throw new StorageFullError();
  }
  window.dispatchEvent(new Event(CHANGED));
}

export function saveUpload(meeting: Meeting): void {
  write([meeting, ...read().filter((m) => m.id !== meeting.id)]);
}

export async function deleteUpload(id: string): Promise<void> {
  write(read().filter((m) => m.id !== id));
  await deleteMedia(id).catch(() => undefined);
}

// useSyncExternalStore needs a snapshot that is referentially stable while the
// data is unchanged, so cache the parsed list against the raw string.
let cache: { raw: string | null; list: Meeting[] } = { raw: null, list: [] };
const EMPTY: Meeting[] = [];

function getSnapshot(): Meeting[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw !== cache.raw) cache = { raw, list: parse(raw) };
  return cache.list;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGED, onChange);
  window.addEventListener("storage", onChange); // other tabs
  return () => {
    window.removeEventListener(CHANGED, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Uploaded meetings from this browser. Empty during server rendering and hydration. */
export function useUploads(): Meeting[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

/** False on the server and during hydration, true afterwards. Lets pages tell "still loading" from "not found". */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

// ---------- recordings (IndexedDB) ----------

const DB_NAME = "fathom-clone";
const STORE = "recordings";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = run(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export const saveMedia = (id: string, blob: Blob) => withStore("readwrite", (s) => s.put(blob, id)).then(() => undefined);
export const getMedia = (id: string) => withStore<Blob | undefined>("readonly", (s) => s.get(id));
export const deleteMedia = (id: string) => withStore("readwrite", (s) => s.delete(id)).then(() => undefined);
