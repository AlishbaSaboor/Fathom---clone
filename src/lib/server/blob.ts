import "server-only";
import { del, head } from "@vercel/blob";
import { GeminiError } from "@/lib/gemini/errors";

// Recordings are stored in Vercel Blob (a public store, so the shared page can
// play them straight from the CDN with seeking). A file's address contains a
// random token and is only ever given to its owner and to people opening its
// share link, which is the same reach as the share link itself.

/** What the store says about a registered file, or null if nothing has been uploaded at that pathname. */
export async function findUploaded(pathname: string): Promise<{ url: string; size: number; contentType: string } | null> {
  try {
    const b = await head(pathname);
    return { url: b.url, size: b.size, contentType: b.contentType };
  } catch (e) {
    if ((e as Error)?.name === "BlobNotFoundError") return null;
    console.error("[blob] could not look up a recording:", (e as Error)?.name ?? "unknown");
    throw new GeminiError("storage_unavailable");
  }
}

/**
 * Removes a file by URL or pathname; true when it is gone (including when it was
 * never there). Callers keep the database record when this is false, so a file
 * that could not be removed is retried later instead of being forgotten while
 * it still counts against the storage quota.
 */
export async function deleteBlob(urlOrPathname: string): Promise<boolean> {
  try {
    await del(urlOrPathname);
    return true;
  } catch (e) {
    console.error("[blob] could not delete a recording:", (e as Error)?.name ?? "unknown");
    return false;
  }
}
