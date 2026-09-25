import "server-only";
import { cookies } from "next/headers";
import { GeminiError } from "@/lib/gemini/errors";
import { OWNER_COOKIE, isOwnerId } from "@/lib/ownerCookie";

/** The anonymous owner id of this browser, or null if it has none (yet). */
export async function getOwnerId(): Promise<string | null> {
  const value = (await cookies()).get(OWNER_COOKIE)?.value;
  return isOwnerId(value) ? value : null;
}

/** For API routes that act on the visitor's own recordings. */
export async function requireOwnerId(): Promise<string> {
  const id = await getOwnerId();
  if (!id) throw new GeminiError("unauthorized");
  return id;
}
